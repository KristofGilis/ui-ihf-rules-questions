import XCTest
@testable import App

@MainActor
final class NativeAppTests: XCTestCase {
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
