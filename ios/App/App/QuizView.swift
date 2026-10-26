import SwiftUI

struct QuizView: View {
    @EnvironmentObject private var app: AppState
    @Environment(\.scenePhase) private var scenePhase
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @ObservedObject var session: QuizSession
    let close: () -> Void
    @State private var leaving = false

    var body: some View {
        NavigationView {
            Group {
                if session.isComplete { results }
                else if let question = session.current { activeQuestion(question) }
            }
            .background(PlayfulBackground())
            .navigationTitle(app.text(session.isComplete ? "quiz_results.title" : "navigation.quiz"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        if session.isComplete { close() } else { leaving = true }
                    } label: {
                        Image(systemName: "xmark").font(.subheadline.weight(.bold))
                            .frame(width: 36, height: 36).background(Playful.paper).clipShape(Circle())
                    }.accessibilityLabel(app.text("native.close")).accessibilityIdentifier("quiz.close")
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    if !session.isComplete, let remaining = session.remaining {
                        TinyBadge(title: QuizSession.clock(remaining), symbol: "timer", color: remaining < 60 ? .red : Playful.navy)
                            .monospacedDigit().accessibilityLabel("\(app.text("native.remaining")): \(QuizSession.clock(remaining))")
                    }
                }
            }
            .safeAreaInset(edge: .bottom, spacing: 0) {
                if !session.isComplete { controls }
            }
            .alert(app.text("quiz.leave_title"), isPresented: $leaving) {
                Button(app.text("quiz.leave_confirm"), role: .destructive) { app.discardQuiz(); close() }
                Button(app.text("quiz.leave_cancel"), role: .cancel) {}
            } message: { Text(app.text("quiz.leave_warning")) }
        }.navigationViewStyle(.stack)
            .onChange(of: scenePhase) { phase in if phase == .active { session.tick() } }
    }

    private func activeQuestion(_ question: Question) -> some View {
        ScrollViewReader { scroll in
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    VStack(alignment: .leading, spacing: 15) {
                        HStack {
                            Text(app.text("native.quiz_eyebrow")).font(.system(.caption2, design: .rounded).weight(.heavy)).tracking(1.6).foregroundColor(Playful.blue)
                            Spacer()
                            Text(app.text("native.question_progress", ["current": String(session.snapshot.index + 1), "total": String(session.snapshot.questions.count)]))
                                .font(.system(.caption, design: .rounded).bold()).foregroundStyle(.secondary)
                                .accessibilityIdentifier("quiz.progress")
                        }
                        HStack(spacing: 4) {
                            ForEach(session.snapshot.questions.indices, id: \.self) { index in
                                Capsule().fill(index <= session.snapshot.index ? Playful.blue : Playful.blue.opacity(0.12)).frame(height: 7)
                            }
                        }.accessibilityHidden(true)
                    }.id("question-top")
                    PaperCard {
                        VStack(alignment: .leading, spacing: 18) {
                            QuestionHeader(question: question, showsNumber: false)
                            Label(app.text("quiz.select_answers"), systemImage: "hand.tap")
                                .font(.caption).foregroundStyle(.secondary)
                        }
                    }
                    VStack(spacing: 12) {
                        ForEach(question.answers) { answer in
                            AnswerRow(answer: answer, selected: session.snapshot.selections[question.id]?.contains(answer.id) ?? false,
                                      showsNumber: false, action: { session.toggle(answer.id) })
                        }
                    }.id(question.id)
                    if session.snapshot.index < session.snapshot.questions.count - 1 {
                        Button(app.text("native.finish")) { session.finish() }
                            .font(.subheadline.weight(.semibold)).frame(maxWidth: .infinity).padding(.vertical, 5)
                            .accessibilityIdentifier("quiz.finish")
                    }
                }.padding(20).padding(.bottom, 10).frame(maxWidth: 760).frame(maxWidth: .infinity)
            }.onChange(of: session.snapshot.index) { _ in scroll.scrollTo("question-top", anchor: .top) }
                .simultaneousGesture(DragGesture(minimumDistance: 60).onEnded { value in
                    guard abs(value.translation.width) > abs(value.translation.height) else { return }
                    withAnimation(reduceMotion ? nil : Playful.spring) { session.move(value.translation.width < 0 ? 1 : -1) }
                })
        }
    }

    private var controls: some View {
        HStack(spacing: 12) {
            Button {
                withAnimation(reduceMotion ? nil : Playful.spring) { session.move(-1) }
            } label: {
                Image(systemName: "arrow.left").font(.headline.weight(.bold))
                    .frame(width: 58, height: 58).background(Playful.paper).clipShape(RoundedRectangle(cornerRadius: 20))
            }.buttonStyle(PressableStyle()).disabled(session.snapshot.index == 0)
                .accessibilityLabel(app.text("quiz.previous"))
                .accessibilityIdentifier("quiz.previous")
            if session.snapshot.index == session.snapshot.questions.count - 1 {
                PrimaryAction(title: app.text("native.finish"), symbol: "checkmark") { session.finish() }
                    .accessibilityIdentifier("quiz.finish")
            } else {
                PrimaryAction(title: app.text("quiz.next")) {
                    withAnimation(reduceMotion ? nil : Playful.spring) { session.move(1) }
                }.accessibilityIdentifier("quiz.next")
            }
        }.padding(.horizontal, 20).padding(.vertical, 12).frame(maxWidth: 800).frame(maxWidth: .infinity)
            .background(.ultraThinMaterial)
    }

    private var results: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 22) {
                ScoreSummary(score: session.score)
                TinyBadge(title: "\(app.text("quiz_results.completion_time")) · \(QuizSession.clock(session.elapsed))", symbol: "clock", color: Playful.navy)
                    .frame(maxWidth: .infinity)
                PrimaryAction(title: app.text("quiz_results.retake"), symbol: "arrow.clockwise") { app.discardQuiz(); close() }
                    .accessibilityIdentifier("quiz.retake")
                SectionHeading(title: app.text("quiz_results.review"), detail: app.text("native.review_detail")).padding(.top, 5)
                ForEach(session.snapshot.questions) { question in
                    PaperCard {
                        VStack(alignment: .leading, spacing: 15) {
                            let wrong = session.score.wrongQuestionIds.contains(question.id)
                            TinyBadge(title: app.text(wrong ? "quiz_results.wrong" : "quiz_results.correct"),
                                      symbol: wrong ? "arrow.clockwise" : "checkmark", color: wrong ? Playful.gold : Playful.success)
                            QuestionHeader(question: question)
                            ForEach(question.answers) { answer in
                                AnswerRow(answer: answer, selected: session.snapshot.selections[question.id]?.contains(answer.id) ?? false, revealed: true)
                            }
                            ReferenceLinks(question: question)
                        }
                    }
                }
            }.padding(20).padding(.bottom, 20).frame(maxWidth: 760).frame(maxWidth: .infinity)
        }
    }
}
