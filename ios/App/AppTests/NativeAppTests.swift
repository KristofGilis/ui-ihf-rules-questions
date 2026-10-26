import XCTest
import SwiftUI
@testable import App

@MainActor
final class NativeAppTests: XCTestCase {
    func testOfflineInformationIsCompleteInEveryLanguage() {
        let locales = AppLocalization.strings
        XCTAssertEqual(Set(locales.keys), Set(["en", "nl", "fr", "srb"]))
        let keys = Set(locales["en"]?.keys.map { $0 } ?? [])
        XCTAssertTrue(keys.contains("info.privacy.local"))
        XCTAssertTrue(keys.contains("info.support.offline"))
        XCTAssertTrue(keys.contains("native.acknowledgements"))
        XCTAssertTrue(keys.contains("native.hero_title"))
        XCTAssertTrue(keys.contains("home.quiz_card.button"))
        for translations in locales.values {
            XCTAssertEqual(Set(translations.keys), keys)
            XCTAssertTrue(translations.values.allSatisfy { !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty })
            for key in keys {
                let placeholders = try! NSRegularExpression(pattern: #"\{\{[^}]+\}\}"#)
                func tokens(_ text: String) -> [String] {
                    placeholders.matches(in: text, range: NSRange(text.startIndex..., in: text))
                        .compactMap { Range($0.range, in: text).map { String(text[$0]) } }.sorted()
                }
                XCTAssertEqual(tokens(translations[key]!), tokens(locales["en"]![key]!), "Placeholder mismatch: \(key)")
            }
        }
    }

    func testSystemSQLitePreservesFilteringAndTreatsArgumentsAsValues() throws {
        let repository = try ContentRepository()
        let all = try repository.questions(locale: "en")
        XCTAssertEqual(try repository.questions(locale: "en", ruleId: "1"), all.filter { $0.ruleId == "1" })
        XCTAssertTrue(try repository.questions(locale: "en", ruleId: "1' OR 1=1 --").isEmpty)
        XCTAssertTrue(try repository.rules(locale: "en' OR 1=1 --").isEmpty)
        XCTAssertTrue(try repository.searchDocuments(locale: "missing").isEmpty)
    }

    func testCourtRetainsOfficialProportionsInAnyContainer() {
        for size in [CGSize(width: 68, height: 136), CGSize(width: 83, height: 116), CGSize(width: 300, height: 100)] {
            let geometry = HandballCourtGeometry(in: CGRect(origin: .zero, size: size))
            XCTAssertEqual(geometry.court.height / geometry.court.width, 2, accuracy: 0.0001)
            let metreAcross = geometry.point(1, 0).x - geometry.point(0, 0).x
            let metreDown = geometry.point(0, 1).y - geometry.point(0, 0).y
            XCTAssertEqual(metreAcross, metreDown, accuracy: 0.0001)
            let area = geometry.goalArea(radius: 6).boundingRect
            XCTAssertEqual(area.width / geometry.scale, 15, accuracy: 0.0001)
            XCTAssertEqual(area.height / geometry.scale, 6, accuracy: 0.0001)
            let freeThrow = geometry.goalArea(radius: 9).boundingRect
            XCTAssertEqual(freeThrow.minX, geometry.court.minX, accuracy: 0.0001)
            XCTAssertEqual(freeThrow.maxX, geometry.court.maxX, accuracy: 0.0001)
            XCTAssertEqual((freeThrow.minY - geometry.court.minY) / geometry.scale, sqrt(9 * 9 - 8.5 * 8.5), accuracy: 0.0001)
            let opposite = geometry.goalArea(radius: 6, bottom: true).boundingRect
            XCTAssertEqual(opposite.minY, geometry.court.maxY - 6 * geometry.scale, accuracy: 0.0001)
        }
    }

    private let configuration = ScoringConfiguration(Correct: 1, InCorrect: -1, NotAnswered: 0, NegativeScore: false, PenalizeGuessingStrategy: true)
    private var sample: Question {
        Question(id: "1.1", number: "1.1", ruleId: "1", phrase: "Example", references: ["1:1"], answers: [
            Answer(id: "a", number: "a", phrase: "A", isCorrect: true),
            Answer(id: "b", number: "b", phrase: "B", isCorrect: true),
            Answer(id: "c", number: "c", phrase: "C", isCorrect: false)
        ])
    }

    func testFirstLaunchContainsEveryLanguageWithoutDownload() async throws {
        let repository = try ContentRepository()
        for locale in ["en", "nl", "fr", "srb"] {
            XCTAssertEqual(try repository.rules(locale: locale).count, 19)
            let questions = try repository.questions(locale: locale)
            XCTAssertEqual(questions.count, 432)
            XCTAssertTrue(questions.allSatisfy { !$0.phrase.isEmpty && $0.answers.contains(where: \.isCorrect) })
            XCTAssertFalse(repository.manifest.locales[locale]!.edition.isEmpty)
        }
    }

    func testScoringMatchesBackendPartialCreditPenaltyAndClamp() async {
        XCTAssertEqual(Scorer.calculate([sample], selections: ["1.1": ["a", "b"]], configuration: configuration),
                       Score(points: 2, total: 2, wrongQuestionIds: []))
        XCTAssertEqual(Scorer.calculate([sample], selections: ["1.1": ["a"]], configuration: configuration),
                       Score(points: 1, total: 2, wrongQuestionIds: ["1.1"]))
        XCTAssertEqual(Scorer.calculate([sample], selections: ["1.1": ["a", "b", "c"]], configuration: configuration).points, 0)
        XCTAssertEqual(Scorer.calculate([sample], selections: ["1.1": ["c"]], configuration: configuration).points, 0)
        XCTAssertEqual(Scorer.calculate([sample], selections: [:], configuration: configuration).wrongQuestionIds, ["1.1"])
    }

    func testScoringHonorsNegativeAndMissedAnswerConfiguration() async {
        let custom = ScoringConfiguration(Correct: 2, InCorrect: -3, NotAnswered: -1, NegativeScore: true, PenalizeGuessingStrategy: false)
        XCTAssertEqual(Scorer.calculate([sample], selections: ["1.1": ["c"]], configuration: custom).points, -5)
        XCTAssertEqual(Scorer.calculate([sample], selections: ["1.1": ["a", "b", "c"]], configuration: custom).points, 1)
    }

    func testSearchNumbersAccentsPartialWordsAndTypos() async {
        let documents = [("1.1", LocalSearch.normalize("1.1 Playing court speelveld terrain")),
                         ("2.1", LocalSearch.normalize("2.1 équipe екипа")),
                         ("1.10", LocalSearch.normalize("1.10 Goal"))]
        XCTAssertEqual(LocalSearch.matchingIds(query: "1.1", documents: documents), ["1.1"])
        XCTAssertEqual(LocalSearch.matchingIds(query: "1.1 court", documents: documents), ["1.1"])
        XCTAssertEqual(LocalSearch.matchingIds(query: "speelv", documents: documents), ["1.1"])
        XCTAssertEqual(LocalSearch.matchingIds(query: "equipe", documents: documents), ["2.1"])
        XCTAssertEqual(LocalSearch.matchingIds(query: "екипа", documents: documents), ["2.1"])
        XCTAssertEqual(LocalSearch.matchingIds(query: "courtt", documents: documents), ["1.1"])
        XCTAssertTrue(LocalSearch.matchingIds(query: "", documents: documents).isEmpty)
    }

    func testSearchFindsOtherLanguageAndReturnsCurrentLanguageQuestion() async throws {
        let repository = try ContentRepository()
        let ids = LocalSearch.matchingIds(query: "speelveld", documents: try repository.searchDocuments(locale: "en"))
        XCTAssertTrue(ids.contains("1.1"))
    }

    func testTimedQuizExpiresAfterBackgroundAndRestoresSelections() async {
        QuizSession.removeSaved()
        let session = QuizSession(questions: [sample], count: 1, timed: true, language: "en", contentHash: "test", configuration: configuration, seed: 1)
        session.toggle("a")
        let restored = QuizSession.restore(contentHash: "test")!
        XCTAssertEqual(restored.snapshot.selections["1.1"], ["a"])
        session.tick(at: session.snapshot.startedAt.addingTimeInterval(150))
        XCTAssertTrue(session.isComplete)
        XCTAssertEqual(session.elapsed, 90)
        XCTAssertEqual(session.remaining, 0)
        XCTAssertNil(QuizSession.restore(contentHash: "new-content"))
        QuizSession.removeSaved()
    }

    func testShufflingIsReproducibleAndQuestionSelectionIsUnique() async throws {
        let questions = try ContentRepository().questions(locale: "en")
        let first = QuizSession(questions: questions, count: 30, timed: false, language: "en", contentHash: "test", configuration: configuration, seed: 42)
        let second = QuizSession(questions: questions, count: 30, timed: false, language: "en", contentHash: "test", configuration: configuration, seed: 42)
        XCTAssertEqual(first.snapshot.questions, second.snapshot.questions)
        XCTAssertEqual(Set(first.snapshot.questions.map(\.id)).count, 30)
        QuizSession.removeSaved()
    }
}
