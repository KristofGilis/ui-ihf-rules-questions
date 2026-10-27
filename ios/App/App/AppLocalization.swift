import Foundation

// Interface copy is independent of the learning database, so wording updates
// preserve the content hash used to restore an existing quiz.
enum AppLocalization {
    static let strings: [String: [String: String]] = {
        var result: [String: [String: String]] = [:]
        for resource in ["InterfaceStrings", "AppInformation"] {
            guard let url = Bundle.main.url(forResource: resource, withExtension: "json", subdirectory: "OfflineContent"),
                  let data = try? Data(contentsOf: url),
                  let locales = try? JSONDecoder().decode([String: [String: String]].self, from: data) else { continue }
            for (language, values) in locales {
                result[language, default: [:]].merge(values) { _, updated in updated }
            }
        }
        return result
    }()
}
