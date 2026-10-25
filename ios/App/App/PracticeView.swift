import SwiftUI

struct AnswerRow: View {
    @EnvironmentObject private var app: AppState
    let answer: Answer
    let selected: Bool
    var revealed = false
    var action: (() -> Void)?

    var body: some View {
        Button { action?() } label: {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: selected ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(selected ? .accentColor : .secondary)
                Text("\(answer.number). \(answer.phrase)").foregroundColor(.primary).multilineTextAlignment(.leading)
                if revealed && answer.isCorrect {
                    Image(systemName: "checkmark.seal.fill").foregroundColor(.green)
                        .accessibilityLabel(app.text("native.correct_answer"))
                } else if revealed && selected {
                    Image(systemName: "xmark.circle.fill").foregroundColor(.red)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading).padding(.vertical, 8)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .disabled(action == nil || revealed)
        .accessibilityValue(app.text(selected ? "native.selected" : "native.not_selected"))
    }
}

struct QuestionHeader: View {
    let question: Question
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(question.number).font(.subheadline.bold()).foregroundStyle(.secondary)
            Text(question.phrase).font(.headline).textSelection(.enabled)
        }.padding(.vertical, 6).accessibilityElement(children: .combine)
    }
}

struct ReferenceLinks: View {
    @EnvironmentObject private var app: AppState
    let question: Question
    var body: some View {
        if !question.references.isEmpty {
            VStack(alignment: .leading, spacing: 8) {
                Text(question.references.joined(separator: ", ")).font(.footnote).foregroundStyle(.secondary)
                ForEach(app.rules.filter { $0.id == question.ruleId }) { rule in
                    NavigationLink("\(rule.number) · \(rule.name)", destination:
                        PracticeView(questions: app.questions.filter { $0.ruleId == rule.id }, title: "\(rule.number) · \(rule.name)"))
                        .font(.footnote)
                }
            }
        }
    }
}

struct PracticeView: View {
    @EnvironmentObject private var app: AppState
    let questions: [Question]
    var title: String? = nil
    @State private var selections: [String: Set<String>] = [:]
    @State private var revealed: Set<String> = []
    @State private var score: Score?

    var body: some View {
        ScrollViewReader { scroll in
            List {
                Section {
                    Button(app.text(revealed.count == questions.count && !questions.isEmpty ? "native.hide_all" : "native.show_all")) {
                        let hide = revealed.count == questions.count
                        if !hide { selections = [:]; score = nil }
                        revealed = hide ? [] : Set(questions.map(\.id))
                    }
                    if !revealed.isEmpty {
                        Text(app.text("native.reveal_warning")).font(.footnote).foregroundStyle(.secondary)
                    }
                    Button(app.text("native.calculate")) {
                        if let configuration = app.repository?.manifest.scoring {
                            score = Scorer.calculate(questions, selections: selections, configuration: configuration)
                            withAnimation { scroll.scrollTo("score", anchor: .top) }
                        }
                    }.disabled(!revealed.isEmpty || questions.isEmpty)
                    Button(app.text("native.reset")) { selections = [:]; score = nil; revealed = [] }
                    if let score = score {
                        ScoreSummary(score: score).id("score")
                        ForEach(questions.filter { score.wrongQuestionIds.contains($0.id) }) { question in
                            Button(question.number) { withAnimation { scroll.scrollTo(question.id, anchor: .top) } }
                        }
                    }
                }
                ForEach(questions) { question in
                    Section {
                        QuestionHeader(question: question).id(question.id)
                        ForEach(question.answers) { answer in
                            AnswerRow(answer: answer, selected: selections[question.id]?.contains(answer.id) ?? false,
                                      revealed: revealed.contains(question.id), action: { toggle(answer, question: question) })
                        }
                        Button(app.text(revealed.contains(question.id) ? "native.hide_answer" : "native.show_answer")) {
                            if revealed.remove(question.id) == nil {
                                revealed.insert(question.id)
                                selections = [:]
                                score = nil
                            }
                        }
                        ReferenceLinks(question: question)
                    } header: {
                        if let score = score {
                            Label(question.number, systemImage: score.wrongQuestionIds.contains(question.id) ? "xmark.circle" : "checkmark.circle")
                        }
                    }
                }
            }.listStyle(.insetGrouped)
        }.navigationTitle(title ?? app.text("questions.title"))
    }

    private func toggle(_ answer: Answer, question: Question) {
        var selected = selections[question.id] ?? []
        if !selected.insert(answer.id).inserted { selected.remove(answer.id) }
        selections[question.id] = selected
        score = nil
    }
}

struct ScoreSummary: View {
    @EnvironmentObject private var app: AppState
    let score: Score
    var questionCount: Int? = nil
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(String(format: "%.0f%%", questionCount.map { $0 > 0 ? Double($0 - score.wrongQuestionIds.count) / Double($0) * 100 : 0 } ?? score.percentage)).font(.largeTitle.bold())
            Text(app.text("native.score", ["score": String(score.points), "total": String(score.total)]))
            if let count = questionCount {
                Text("\(app.text("quiz_results.correct")): \(count - score.wrongQuestionIds.count) / \(count)")
            }
            Text("\(app.text("quiz_results.wrong")): \(score.wrongQuestionIds.count)").foregroundStyle(.secondary)
        }.padding(.vertical, 8).accessibilityElement(children: .combine)
    }
}

struct SearchView: View {
    @EnvironmentObject private var app: AppState
    @State private var query = ""
    @State private var matches: [Question] = []
    @State private var searching = false

    var body: some View {
        List {
            if query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                Text(app.text("native.search_hint")).foregroundStyle(.secondary)
            } else if searching {
                ProgressView()
            } else if matches.isEmpty {
                Text(app.text("search.no_results"))
            }
            ForEach(matches) { question in
                NavigationLink(destination: PracticeView(questions: [question], title: question.number)) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(question.number).font(.subheadline.bold())
                        Text(question.phrase).lineLimit(3)
                    }.padding(.vertical, 4)
                }
            }
        }
        .navigationTitle(app.text("search.title"))
        .searchable(text: $query, prompt: app.text("search.placeholder"))
        .task(id: query) {
            guard !query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { matches = []; return }
            searching = true
            do { try await Task.sleep(nanoseconds: 250_000_000) } catch { return }
            let term = query
            let documents = app.searchDocuments
            let ids = await Task.detached(priority: .userInitiated) {
                LocalSearch.matchingIds(query: term, documents: documents)
            }.value
            guard !Task.isCancelled else { return }
            matches = app.questions.filter { ids.contains($0.id) }
            searching = false
        }
    }
}
