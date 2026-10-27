import SwiftUI

struct AnswerRow: View {
    @EnvironmentObject private var app: AppState
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let answer: Answer
    let selected: Bool
    var revealed = false
    var showsNumber = true
    var action: (() -> Void)?
    private var correct: Bool { revealed && answer.isCorrect }
    private var wrong: Bool { revealed && selected && !answer.isCorrect }
    private var accent: Color { correct ? Playful.success : (wrong ? .red : Playful.blue) }

    var body: some View {
        Button {
            withAnimation(reduceMotion ? nil : Playful.spring) { action?() }
        } label: {
            HStack(alignment: .top, spacing: 13) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12).fill(selected || correct ? accent : Playful.background)
                    if correct || selected {
                        Image(systemName: wrong ? "xmark" : "checkmark").font(.subheadline.weight(.heavy)).foregroundColor(.white)
                    } else if showsNumber && !revealed {
                        Text(answer.number.uppercased()).font(.system(.subheadline, design: .rounded).weight(.heavy)).foregroundColor(.secondary)
                    }
                }.frame(width: 36, height: 36).accessibilityHidden(true)
                Text(showsNumber && revealed ? "\(answer.number.uppercased()). \(answer.phrase)" : answer.phrase)
                    .font(.body).foregroundColor(.primary)
                    .multilineTextAlignment(.leading).fixedSize(horizontal: false, vertical: true)
                    .frame(maxWidth: .infinity, alignment: .leading).padding(.vertical, 6)
                if correct {
                    Image(systemName: "checkmark.seal.fill").foregroundColor(Playful.success).padding(.top, 8)
                        .accessibilityLabel(app.text("native.correct_answer"))
                }
            }.padding(15).frame(maxWidth: .infinity, alignment: .leading)
                .background((selected || correct || wrong) ? accent.opacity(0.07) : Playful.paper)
                .clipShape(RoundedRectangle(cornerRadius: 21, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 21, style: .continuous).strokeBorder(
                    selected || correct || wrong ? accent.opacity(0.85) : Color.primary.opacity(0.07), lineWidth: selected || correct ? 2 : 1))
        }.buttonStyle(PressableStyle()).disabled(action == nil || revealed)
            .accessibilityLabel(showsNumber ? "\(answer.number.uppercased()). \(answer.phrase)" : answer.phrase)
            .accessibilityValue(app.text(selected ? "native.selected" : "native.not_selected"))
            .accessibilityIdentifier("answer.\(answer.id)")
    }
}

struct QuestionHeader: View {
    let question: Question
    var showsNumber = true
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            if showsNumber { TinyBadge(title: question.number, symbol: "number", color: Playful.navy) }
            Text(question.phrase).font(.system(.title3, design: .rounded).weight(.bold))
                .fixedSize(horizontal: false, vertical: true).textSelection(.enabled)
        }.frame(maxWidth: .infinity, alignment: .leading).accessibilityElement(children: .combine)
            .accessibilityIdentifier("question.\(question.id)")
    }
}

struct ReferenceLinks: View {
    @EnvironmentObject private var app: AppState
    let question: Question
    var body: some View {
        if !question.references.isEmpty {
            VStack(alignment: .leading, spacing: 8) {
                Label(question.references.joined(separator: ", "), systemImage: "bookmark")
                    .font(.caption).foregroundStyle(.secondary)
                ForEach(app.rules.filter { $0.id == question.ruleId }) { rule in
                    NavigationLink("\(rule.number) · \(rule.name)", destination:
                        PracticeView(questions: app.questions.filter { $0.ruleId == rule.id }, title: "\(rule.number) · \(rule.name)"))
                        .font(.subheadline.weight(.semibold))
                }
            }
        }
    }
}

struct PracticeView: View {
    @EnvironmentObject private var app: AppState
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let questions: [Question]
    var title: String? = nil
    @State private var selections: [String: Set<String>] = [:]
    @State private var revealed: Set<String> = []
    @State private var score: Score?
    @State private var scoreScrollRequest = UUID()

    var body: some View {
        ScrollViewReader { scroll in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 25) {
                    SectionHeading(title: app.text("native.study_title"), detail: app.text("native.questions", ["count": String(questions.count)]))
                    PaperCard(tint: Playful.navy) {
                        VStack(alignment: .leading, spacing: 13) {
                            HStack(alignment: .top) {
                                Label(app.text("native.study_mode"), systemImage: "sparkles")
                                    .font(.system(.headline, design: .rounded).bold())
                                Spacer(minLength: 8)
                                Button(app.text("native.reset")) { selections = [:]; score = nil; revealed = [] }
                                    .font(.caption.weight(.semibold))
                            }
                            Text(app.text("native.study_hint")).font(.subheadline).foregroundStyle(.secondary)
                            Button {
                                let hide = revealed.count == questions.count
                                if !hide { selections = [:]; score = nil }
                                revealed = hide ? [] : Set(questions.map(\.id))
                            } label: {
                                Label(app.text(revealed.count == questions.count && !questions.isEmpty ? "native.hide_all" : "native.show_all"),
                                      systemImage: revealed.count == questions.count ? "eye.slash" : "eye")
                                    .font(.subheadline.weight(.semibold))
                            }
                            if !revealed.isEmpty { Text(app.text("native.reveal_warning")).font(.caption).foregroundStyle(.secondary) }
                        }
                    }
                    if let score = score {
                        ScoreSummary(score: score, questionCount: questions.count).id("score")
                        if !score.wrongQuestionIds.isEmpty {
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 9) {
                                    ForEach(questions.filter { score.wrongQuestionIds.contains($0.id) }) { question in
                                        Button {
                                            withAnimation(reduceMotion ? nil : Playful.spring) { scroll.scrollTo(question.id, anchor: .top) }
                                        } label: { TinyBadge(title: question.number, symbol: "arrow.down", color: .red) }
                                            .buttonStyle(PressableStyle())
                                    }
                                }
                            }
                        }
                    }
                    ForEach(questions) { question in
                        VStack(alignment: .leading, spacing: 13) {
                            HStack(alignment: .top) {
                                QuestionHeader(question: question)
                                if let score = score {
                                    Image(systemName: score.wrongQuestionIds.contains(question.id) ? "xmark.circle.fill" : "checkmark.circle.fill")
                                        .font(.title2).foregroundColor(score.wrongQuestionIds.contains(question.id) ? .red : Playful.success)
                                        .accessibilityLabel(app.text(score.wrongQuestionIds.contains(question.id) ? "quiz_results.wrong" : "quiz_results.correct"))
                                }
                            }
                            ForEach(question.answers) { answer in
                                AnswerRow(answer: answer, selected: selections[question.id]?.contains(answer.id) ?? false,
                                          revealed: revealed.contains(question.id), action: { toggle(answer, question: question) })
                            }
                            Button {
                                if revealed.remove(question.id) == nil {
                                    revealed.insert(question.id); selections = [:]; score = nil
                                }
                            } label: {
                                Label(app.text(revealed.contains(question.id) ? "native.hide_answer" : "native.show_answer"),
                                      systemImage: revealed.contains(question.id) ? "eye.slash" : "eye")
                                    .font(.subheadline.weight(.semibold)).padding(.vertical, 8)
                            }
                            if revealed.contains(question.id) { ReferenceLinks(question: question) }
                        }.padding(.vertical, 6).id(question.id)
                        Divider()
                    }
                }.padding(20).padding(.bottom, 22).frame(maxWidth: 760).frame(maxWidth: .infinity)
            }
            .safeAreaInset(edge: .bottom, spacing: 0) {
                PrimaryAction(title: app.text("native.calculate"), symbol: "checkmark.circle.fill") {
                    if let configuration = app.repository?.manifest.scoring {
                        score = Scorer.calculate(questions, selections: selections, configuration: configuration)
                        scoreScrollRequest = UUID()
                    }
                }.accessibilityIdentifier("practice.calculate").disabled(!revealed.isEmpty || questions.isEmpty).opacity(revealed.isEmpty ? 1 : 0.45)
                    .padding(.horizontal, 20).padding(.vertical, 10).frame(maxWidth: 800).frame(maxWidth: .infinity)
                    .background(.ultraThinMaterial)
            }
            .onChange(of: scoreScrollRequest) { _ in
                // Wait until SwiftUI has registered the newly inserted score card.
                DispatchQueue.main.async {
                    guard score != nil else { return }
                    withAnimation(reduceMotion ? nil : Playful.spring) { scroll.scrollTo("score", anchor: .top) }
                }
            }
        }.background(PlayfulBackground()).navigationTitle(title ?? app.text("questions.title")).navigationBarTitleDisplayMode(.inline)
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
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let score: Score
    var questionCount: Int? = nil
    @State private var appeared = false
    @ScaledMetric(relativeTo: .largeTitle) private var scoreDiameter: CGFloat = 174
    private var ringSize: CGFloat { min(240, scoreDiameter) }
    private var fraction: Double { min(1, max(0, score.percentage / 100)) }

    var body: some View {
        PaperCard {
            VStack(spacing: 22) {
                ZStack {
                    Circle().stroke(Playful.background, lineWidth: 13)
                    Circle().trim(from: 0, to: appeared ? fraction : 0)
                        .stroke(score.percentage >= 50 ? Playful.blue : Playful.gold, style: StrokeStyle(lineWidth: 13, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                    VStack(spacing: 5) {
                        Image(systemName: score.percentage >= 75 ? "trophy.fill" : "sparkles").font(.title2).foregroundColor(Playful.gold)
                        Text(String(format: questionCount == nil ? "%.0f%%" : "%.2f%%", score.percentage))
                            .font(.system(.largeTitle, design: .rounded).weight(.black))
                            .lineLimit(1).minimumScaleFactor(0.2).allowsTightening(true)
                            .accessibilityIdentifier("score.percentage")
                        Text(app.text("score_overview.title")).font(.caption).foregroundStyle(.secondary)
                    }.padding(20)
                }.frame(width: ringSize, height: ringSize).padding(.top, 7)
                Text(app.text(score.percentage >= 75 ? "native.result_high" : "native.result_keep_going"))
                    .font(.system(.title2, design: .rounded).weight(.heavy)).multilineTextAlignment(.center)
                Text(app.text("native.score", ["score": String(score.points), "total": String(score.total)]))
                    .font(.subheadline).foregroundStyle(.secondary)
                HStack(spacing: 13) {
                    resultStat(title: app.text("quiz_results.correct"), value: questionCount.map { $0 - score.wrongQuestionIds.count } ?? score.points, color: Playful.success, symbol: "checkmark")
                    resultStat(title: app.text("quiz_results.wrong"), value: questionCount == nil ? score.total - score.points : score.wrongQuestionIds.count, color: Playful.gold, symbol: "arrow.clockwise")
                }
            }.frame(maxWidth: .infinity)
        }.accessibilityElement(children: .contain).accessibilityIdentifier("score.summary")
            .onAppear { withAnimation(reduceMotion ? nil : .easeOut(duration: 0.8)) { appeared = true } }
    }

    private func resultStat(title: String, value: Int, color: Color, symbol: String) -> some View {
        VStack(spacing: 7) {
            Label(String(value), systemImage: symbol).font(.system(.title2, design: .rounded).weight(.heavy)).foregroundColor(color)
            Text(title).font(.caption.weight(.semibold)).foregroundStyle(.secondary)
        }.frame(maxWidth: .infinity).padding(.vertical, 15).background(color.opacity(0.08)).clipShape(RoundedRectangle(cornerRadius: 18))
    }
}

struct SearchView: View {
    @EnvironmentObject private var app: AppState
    @State private var query = ""
    @State private var matches: [Question] = []
    @State private var searching = false

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 14) {
                if query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    EmptyPlayState(title: app.text("native.search_title"), detail: app.text("native.search_hint"))
                    HStack(spacing: 9) {
                        ForEach(["1.1", "2.1", "16.1"], id: \.self) { number in
                            Button { query = number } label: { TinyBadge(title: number, symbol: "number", color: Playful.navy) }
                                .buttonStyle(PressableStyle()).accessibilityIdentifier("search.example.\(number)")
                        }
                    }.frame(maxWidth: .infinity)
                } else if searching {
                    ProgressView().frame(maxWidth: .infinity).padding(40)
                } else if matches.isEmpty {
                    EmptyPlayState(title: app.text("search.no_results"), detail: app.text("native.search_hint"), symbol: "sparkle.magnifyingglass")
                } else {
                    TinyBadge(title: app.text("native.questions", ["count": String(matches.count)]), symbol: "magnifyingglass")
                }
                ForEach(matches) { question in
                    NavigationLink(destination: PracticeView(questions: [question], title: question.number)) {
                        PaperCard {
                            VStack(alignment: .leading, spacing: 12) {
                                HStack { TinyBadge(title: question.number, symbol: "number", color: Playful.navy); Spacer(); Image(systemName: "arrow.up.right").foregroundColor(Playful.navy) }
                                Text(question.phrase).font(.system(.headline, design: .rounded)).foregroundColor(.primary).lineLimit(4)
                            }
                        }
                    }.buttonStyle(PressableStyle()).accessibilityIdentifier("search.result.\(question.id)")
                }
            }.padding(20).padding(.bottom, 20).frame(maxWidth: 760).frame(maxWidth: .infinity)
        }.background(PlayfulBackground()).navigationTitle(app.text("search.title")).navigationBarTitleDisplayMode(.inline)
            .searchable(text: $query, prompt: app.text("search.placeholder"))
            .task(id: query) {
                guard !query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { matches = []; searching = false; return }
                searching = true
                do { try await Task.sleep(nanoseconds: 250_000_000) } catch { return }
                let term = query, documents = app.searchDocuments
                let ids = await Task.detached(priority: .userInitiated) { LocalSearch.matchingIds(query: term, documents: documents) }.value
                guard !Task.isCancelled else { return }
                matches = app.questions.filter { ids.contains($0.id) }
                searching = false
            }
    }
}
