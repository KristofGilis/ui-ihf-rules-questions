import Foundation
import GRDB

final class ContentRepository {
    let manifest: ContentManifest
    private let database: DatabaseQueue
    private let decoder = JSONDecoder()

    init(bundle: Bundle = .main) throws {
        guard let url = bundle.url(forResource: "content", withExtension: "sqlite", subdirectory: "OfflineContent") else {
            throw CocoaError(.fileNoSuchFile)
        }
        var configuration = Configuration()
        configuration.readonly = true
        database = try DatabaseQueue(path: url.path, configuration: configuration)
        let payload = try database.read { db in
            try String.fetchOne(db, sql: "SELECT value FROM metadata WHERE key = 'manifest'")
        }
        guard let payload = payload?.data(using: .utf8) else { throw CocoaError(.fileReadCorruptFile) }
        manifest = try decoder.decode(ContentManifest.self, from: payload)
        guard manifest.schemaVersion == 1, Set(manifest.locales.keys) == Set(["en", "nl", "fr", "srb"]) else {
            throw CocoaError(.fileReadCorruptFile)
        }
    }

    func rules(locale: String) throws -> [Rule] {
        try database.read { db in
            try String.fetchAll(db, sql: "SELECT payload FROM rules WHERE locale = ? ORDER BY position", arguments: [locale])
                .map { try decoder.decode(Rule.self, from: Data($0.utf8)) }
        }
    }

    func questions(locale: String, ruleId: String? = nil) throws -> [Question] {
        try database.read { db in
            let payloads: [String]
            if let ruleId = ruleId {
                payloads = try String.fetchAll(db, sql: "SELECT payload FROM questions WHERE locale = ? AND ruleId = ? ORDER BY position", arguments: [locale, ruleId])
            } else {
                payloads = try String.fetchAll(db, sql: "SELECT payload FROM questions WHERE locale = ? ORDER BY position", arguments: [locale])
            }
            return try payloads.map { try decoder.decode(Question.self, from: Data($0.utf8)) }
        }
    }

    func searchDocuments(locale: String) throws -> [(String, String)] {
        try database.read { db in
            try Row.fetchAll(db, sql: "SELECT id, searchText FROM questions WHERE locale = ? ORDER BY position", arguments: [locale])
                .map { ($0["id"], $0["searchText"]) }
        }
    }
}

enum LocalSearch {
    static func normalize(_ text: String) -> String {
        text.folding(options: [.diacriticInsensitive, .caseInsensitive], locale: Locale(identifier: "en_US_POSIX"))
    }

    static func tokens(_ text: String) -> [String] {
        normalize(text).components(separatedBy: CharacterSet.alphanumerics.inverted).filter { !$0.isEmpty }
    }

    static func matchingIds(query: String, documents: [(String, String)]) -> Set<String> {
        let terms = tokens(query)
        guard !terms.isEmpty else { return [] }
        let strict = documents.filter { _, text in terms.allSatisfy { text.contains($0) } }
        if !strict.isEmpty { return Set(strict.map(\.0)) }
        return Set(documents.compactMap { id, text in
            let words = tokens(text)
            return terms.allSatisfy { term in words.contains { word in
                if word.contains(term) { return true }
                let limit = term.count <= 4 ? 1 : 2
                return term.count >= 3 && distance(term, word, limit: limit) <= limit
            } } ? id : nil
        })
    }

    private static func distance(_ left: String, _ right: String, limit: Int) -> Int {
        let a = Array(left), b = Array(right)
        guard abs(a.count - b.count) <= limit else { return limit + 1 }
        var previous = Array(0...b.count)
        for (i, first) in a.enumerated() {
            var current = [i + 1]
            for (j, second) in b.enumerated() {
                current.append(min(current[j] + 1, previous[j + 1] + 1, previous[j] + (first == second ? 0 : 1)))
            }
            previous = current
        }
        return previous[b.count]
    }
}
