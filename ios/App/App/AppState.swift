import SwiftUI

@MainActor
final class AppState: ObservableObject {
    @Published private(set) var repository: ContentRepository?
    @Published private(set) var rules: [Rule] = []
    @Published private(set) var questions: [Question] = []
    @Published private(set) var searchDocuments: [(String, String)] = []
    @Published var loadFailed = false
    @Published var session: QuizSession?
    @Published var language: String {
        didSet { UserDefaults.standard.set(language, forKey: "native.language"); loadLanguage() }
    }
    @Published var appearance: String {
        didSet { UserDefaults.standard.set(appearance, forKey: "native.appearance") }
    }
    let languages = [("en", "English"), ("nl", "Nederlands"), ("fr", "Français"), ("srb", "Српски")]

    init() {
        #if DEBUG
        if ProcessInfo.processInfo.arguments.contains("-ui-testing-reset") {
            UserDefaults.standard.removeObject(forKey: "native.quiz")
        }
        #endif
        let system = Locale.preferredLanguages.first?.prefix(2).lowercased() ?? "en"
        let suggested = system == "sr" ? "srb" : system
        let saved = UserDefaults.standard.string(forKey: "native.language") ?? suggested
        language = ["en", "nl", "fr", "srb"].contains(saved) ? saved : "en"
        appearance = UserDefaults.standard.string(forKey: "native.appearance") ?? "system"
        load()
    }

    var colorScheme: ColorScheme? { appearance == "system" ? nil : (appearance == "dark" ? .dark : .light) }
    var edition: String { repository?.manifest.locales[language]?.edition ?? "" }
    var version: String {
        let info = Bundle.main.infoDictionary ?? [:]
        return "\(info["CFBundleShortVersionString"] as? String ?? "1.0") (\(info["CFBundleVersion"] as? String ?? "0"))"
    }

    func text(_ key: String, _ replacements: [String: String] = [:]) -> String {
        var value = repository?.manifest.locales[language]?.strings[key]
            ?? repository?.manifest.locales["en"]?.strings[key] ?? [
                "native.load_error": "Bundled content could not be opened. Try again or contact support. No download is required.",
                "native.retry": "Try again"
            ][key] ?? key
        for (name, replacement) in replacements { value = value.replacingOccurrences(of: "{{\(name)}}", with: replacement) }
        return value
    }

    func load() {
        do {
            repository = try ContentRepository()
            loadLanguage()
            if let repository = repository {
                session = QuizSession.restore(contentHash: repository.manifest.contentHash)
            }
        } catch { loadFailed = true }
    }

    private func loadLanguage() {
        guard let repository = repository else { return }
        do {
            rules = try repository.rules(locale: language)
            questions = try repository.questions(locale: language)
            searchDocuments = try repository.searchDocuments(locale: language)
            loadFailed = false
        } catch { loadFailed = true }
    }

    func startQuiz(count: Int, timed: Bool) {
        guard let manifest = repository?.manifest else { return }
        session = QuizSession(questions: questions, count: count, timed: timed, language: language,
                              contentHash: manifest.contentHash, configuration: manifest.scoring)
    }

    func discardQuiz() {
        session = nil
        QuizSession.removeSaved()
    }
}
