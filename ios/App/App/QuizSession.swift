import Foundation
import Combine

@MainActor
final class QuizSession: ObservableObject, Identifiable {
    struct Snapshot: Codable {
        var questions: [Question]
        var selections: [String: Set<String>]
        var index: Int
        var startedAt: Date
        var deadline: Date?
        var completedAt: Date?
        var language: String
        var contentHash: String
        var configuration: ScoringConfiguration
    }
    let id = UUID()
    @Published private(set) var snapshot: Snapshot
    @Published private(set) var now = Date()
    private var timer: AnyCancellable?

    init(questions: [Question], count: Int, timed: Bool, language: String,
         contentHash: String, configuration: ScoringConfiguration, seed: UInt64 = UInt64.random(in: 0...UInt64.max)) {
        var generator = SeededGenerator(state: seed)
        let chosen = Array(questions.shuffled(using: &generator).prefix(count)).map { question -> Question in
            var copy = question
            copy.answers.shuffle(using: &generator)
            return copy
        }
        let start = Date()
        snapshot = Snapshot(questions: chosen, selections: [:], index: 0, startedAt: start,
                            deadline: timed ? start.addingTimeInterval(Double(chosen.count * 90)) : nil,
                            completedAt: nil, language: language, contentHash: contentHash, configuration: configuration)
        persist()
        startTimer()
    }

    private init(snapshot: Snapshot) {
        self.snapshot = snapshot
        tick()
        startTimer()
    }

    var current: Question? { snapshot.questions.indices.contains(snapshot.index) ? snapshot.questions[snapshot.index] : nil }
    var isComplete: Bool { snapshot.completedAt != nil }
    var remaining: Int? { snapshot.deadline.map { max(0, Int(ceil($0.timeIntervalSince(now)))) } }
    var elapsed: Int { max(0, Int((snapshot.completedAt ?? now).timeIntervalSince(snapshot.startedAt))) }
    var score: Score { Scorer.calculate(snapshot.questions, selections: snapshot.selections, configuration: snapshot.configuration) }

    func toggle(_ answer: String) {
        guard !isComplete, let current = current else { return }
        var selected = snapshot.selections[current.id] ?? []
        if !selected.insert(answer).inserted { selected.remove(answer) }
        snapshot.selections[current.id] = selected
        persist()
    }

    func move(_ delta: Int) {
        guard !isComplete else { return }
        snapshot.index = min(max(0, snapshot.index + delta), max(0, snapshot.questions.count - 1))
        persist()
    }

    func finish(at date: Date = Date()) {
        guard !isComplete else { return }
        snapshot.completedAt = min(date, snapshot.deadline ?? date)
        timer?.cancel()
        persist()
    }

    func tick(at date: Date = Date()) {
        now = date
        if let remaining = remaining, remaining == 0 { finish(at: date) }
    }

    private func startTimer() {
        guard !isComplete else { return }
        timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect().sink { [weak self] _ in self?.tick() }
    }

    private func persist() {
        if let data = try? JSONEncoder().encode(snapshot) { UserDefaults.standard.set(data, forKey: "native.quiz") }
    }

    static func removeSaved() { UserDefaults.standard.removeObject(forKey: "native.quiz") }

    static func restore(contentHash: String) -> QuizSession? {
        guard let data = UserDefaults.standard.data(forKey: "native.quiz"),
              let saved = try? JSONDecoder().decode(Snapshot.self, from: data),
              saved.contentHash == contentHash, !saved.questions.isEmpty,
              saved.questions.indices.contains(saved.index) else {
            removeSaved()
            return nil
        }
        return QuizSession(snapshot: saved)
    }

    static func clock(_ seconds: Int) -> String { String(format: "%d:%02d", seconds / 60, seconds % 60) }
}
