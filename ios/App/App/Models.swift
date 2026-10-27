import Foundation

struct Rule: Codable, Identifiable, Hashable {
    let id: String
    let number: String
    let name: String
}

struct Answer: Codable, Identifiable, Hashable {
    let id: String
    let number: String
    let phrase: String
    let isCorrect: Bool
}

struct Question: Codable, Identifiable, Hashable {
    let id: String
    let number: String
    let ruleId: String
    let phrase: String
    let references: [String]
    var answers: [Answer]
}

struct ScoringConfiguration: Codable {
    let Correct: Int
    let InCorrect: Int
    let NotAnswered: Int
    let NegativeScore: Bool
    let PenalizeGuessingStrategy: Bool
}

struct LocaleContent: Codable {
    let edition: String
    let strings: [String: String]
}

struct ContentManifest: Codable {
    let schemaVersion: Int
    let sourceRevision: String
    let scoringRevision: String
    let contentHash: String
    let scoring: ScoringConfiguration
    let locales: [String: LocaleContent]
}

struct Score: Equatable {
    let points: Int
    let total: Int
    let wrongQuestionIds: [String]
    var percentage: Double { total > 0 ? Double(points) / Double(total) * 100 : 0 }
}

enum Scorer {
    // Mirrors CalculateScore in the API, including all-selected penalties and partial credit.
    static func calculate(_ questions: [Question], selections: [String: Set<String>], configuration c: ScoringConfiguration) -> Score {
        var points = 0
        var total = 0
        var wrong: [String] = []
        for question in questions {
            let selected = selections[question.id] ?? []
            total += question.answers.filter(\.isCorrect).count
            var value = 0
            var mistake = false
            if c.PenalizeGuessingStrategy && !question.answers.isEmpty && question.answers.allSatisfy({ selected.contains($0.id) }) {
                mistake = true
            } else {
                for answer in question.answers {
                    if answer.isCorrect {
                        value += selected.contains(answer.id) ? c.Correct : c.NotAnswered
                        if !selected.contains(answer.id) { mistake = true }
                    } else if selected.contains(answer.id) {
                        value += c.InCorrect
                        mistake = true
                    }
                }
                if !c.NegativeScore { value = max(0, value) }
            }
            points += value
            if mistake { wrong.append(question.id) }
        }
        return Score(points: points, total: total, wrongQuestionIds: wrong)
    }
}

struct SeededGenerator: RandomNumberGenerator {
    var state: UInt64
    mutating func next() -> UInt64 {
        state &+= 0x9e3779b97f4a7c15
        var value = state
        value = (value ^ (value >> 30)) &* 0xbf58476d1ce4e5b9
        value = (value ^ (value >> 27)) &* 0x94d049bb133111eb
        return value ^ (value >> 31)
    }
}
