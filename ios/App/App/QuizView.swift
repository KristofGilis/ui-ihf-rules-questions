import SwiftUI

struct QuizView: View {
    @EnvironmentObject private var app: AppState
    @Environment(\.scenePhase) private var scenePhase
    @ObservedObject var session: QuizSession
    let close: () -> Void
    @State private var leaving = false

    var body: some View {
        NavigationView {
            Group {
                if session.isComplete {
                    results
                } else if let question = session.current {
                    List {
                        Section {
                            Text(app.text("native.question_progress", ["current": String(session.snapshot.index + 1), "total": String(session.snapshot.questions.count)]))
                                .font(.subheadline).accessibilityIdentifier("quiz.progress")
                            ProgressView(value: Double(session.snapshot.index + 1), total: Double(session.snapshot.questions.count))
                            if let remaining = session.remaining {
                                Label("\(app.text("native.remaining")): \(QuizSession.clock(remaining))", systemImage: "clock")
                                    .monospacedDigit().foregroundColor(remaining < 60 ? .red : .primary)
                            }
                        }
                        Section {
                            QuestionHeader(question: question)
                            ForEach(question.answers) { answer in
                                AnswerRow(answer: answer, selected: session.snapshot.selections[question.id]?.contains(answer.id) ?? false,
                                          action: { session.toggle(answer.id) })
                            }
                        }
                        Section {
                            HStack {
                                Button { session.move(-1) } label: {
                                    Label(app.text("quiz.previous"), systemImage: "chevron.left")
                                }.disabled(session.snapshot.index == 0)
                                Spacer()
                                Button { session.move(1) } label: {
                                    Label(app.text("quiz.next"), systemImage: "chevron.right")
                                }.disabled(session.snapshot.index == session.snapshot.questions.count - 1)
                            }.buttonStyle(.bordered)
                            Button(app.text("native.finish")) { session.finish() }
                                .buttonStyle(.borderedProminent).frame(maxWidth: .infinity).padding(.vertical, 6)
                        }
                    }
                    .listStyle(.insetGrouped)
                    .simultaneousGesture(DragGesture(minimumDistance: 60).onEnded { value in
                        guard abs(value.translation.width) > abs(value.translation.height) else { return }
                        session.move(value.translation.width < 0 ? 1 : -1)
                    })
                }
            }
            .navigationTitle(app.text(session.isComplete ? "quiz_results.title" : "navigation.quiz"))
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(app.text("native.close")) {
                        if session.isComplete { close() } else { leaving = true }
                    }
                }
            }
            .alert(app.text("quiz.leave_title"), isPresented: $leaving) {
                Button(app.text("quiz.leave_confirm"), role: .destructive) { app.discardQuiz(); close() }
                Button(app.text("quiz.leave_cancel"), role: .cancel) {}
            } message: { Text(app.text("quiz.leave_warning")) }
        }
        .navigationViewStyle(.stack)
        .onChange(of: scenePhase) { phase in if phase == .active { session.tick() } }
    }

    private var results: some View {
        List {
            Section {
                ScoreSummary(score: session.score)
                Text("\(app.text("quiz_results.completion_time")): \(QuizSession.clock(session.elapsed))")
                    .foregroundStyle(.secondary)
                Button(app.text("quiz_results.retake")) { app.discardQuiz(); close() }
            }
            ForEach(session.snapshot.questions) { question in
                Section {
                    QuestionHeader(question: question)
                    ForEach(question.answers) { answer in
                        AnswerRow(answer: answer, selected: session.snapshot.selections[question.id]?.contains(answer.id) ?? false, revealed: true)
                    }
                    ReferenceLinks(question: question)
                } header: {
                    Label(app.text(session.score.wrongQuestionIds.contains(question.id) ? "quiz_results.wrong" : "quiz_results.correct"),
                          systemImage: session.score.wrongQuestionIds.contains(question.id) ? "xmark.circle" : "checkmark.circle")
                }
            }
        }.listStyle(.insetGrouped)
    }
}
