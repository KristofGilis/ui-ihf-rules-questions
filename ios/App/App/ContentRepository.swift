import Foundation
import SQLite3

final class ContentRepository {
    let manifest: ContentManifest
    private let database: OpaquePointer
    private let decoder = JSONDecoder()

    private struct DatabaseError: LocalizedError {
        let code: Int32
        let message: String
        var errorDescription: String? { "SQLite (\(code)): \(message)" }
    }

    init(bundle: Bundle = .main) throws {
        guard let url = bundle.url(forResource: "content", withExtension: "sqlite", subdirectory: "OfflineContent") else {
            throw CocoaError(.fileNoSuchFile)
        }
        var handle: OpaquePointer?
        let status = sqlite3_open_v2(url.path, &handle, SQLITE_OPEN_READONLY | SQLITE_OPEN_FULLMUTEX, nil)
        guard status == SQLITE_OK, let opened = handle else {
            let message = handle.map { String(cString: sqlite3_errmsg($0)) } ?? "Could not open bundled database"
            if let handle = handle { sqlite3_close(handle) }
            throw DatabaseError(code: status, message: message)
        }
        do {
            guard let payload = try Self.rows(in: opened, sql: "SELECT value FROM metadata WHERE key = 'manifest'").first?.first else {
                throw CocoaError(.fileReadCorruptFile)
            }
            let loaded = try JSONDecoder().decode(ContentManifest.self, from: Data(payload.utf8))
            guard loaded.schemaVersion == 1, Set(loaded.locales.keys) == Set(["en", "nl", "fr", "srb"]) else {
                throw CocoaError(.fileReadCorruptFile)
            }
            manifest = loaded
            database = opened
        } catch {
            sqlite3_close(opened)
            throw error
        }
    }

    deinit { sqlite3_close(database) }

    func rules(locale: String) throws -> [Rule] {
        try Self.rows(in: database, sql: "SELECT payload FROM rules WHERE locale = ? ORDER BY position", arguments: [locale])
            .map { try decoder.decode(Rule.self, from: Data($0[0].utf8)) }
    }

    func questions(locale: String, ruleId: String? = nil) throws -> [Question] {
        let sql = ruleId == nil
            ? "SELECT payload FROM questions WHERE locale = ? ORDER BY position"
            : "SELECT payload FROM questions WHERE locale = ? AND ruleId = ? ORDER BY position"
        let arguments = ruleId.map { [locale, $0] } ?? [locale]
        return try Self.rows(in: database, sql: sql, arguments: arguments)
            .map { try decoder.decode(Question.self, from: Data($0[0].utf8)) }
    }

    func searchDocuments(locale: String) throws -> [(String, String)] {
        try Self.rows(in: database, sql: "SELECT id, searchText FROM questions WHERE locale = ? ORDER BY position", arguments: [locale])
            .map { ($0[0], $0[1]) }
    }

    private static func rows(in database: OpaquePointer, sql: String, arguments: [String] = []) throws -> [[String]] {
        var prepared: OpaquePointer?
        defer { sqlite3_finalize(prepared) }
        let status = sqlite3_prepare_v2(database, sql, -1, &prepared, nil)
        guard status == SQLITE_OK, let statement = prepared else {
            throw DatabaseError(code: status, message: String(cString: sqlite3_errmsg(database)))
        }
        // SQLite copies each UTF-8 argument before its temporary Swift buffer expires.
        let transient = unsafeBitCast(-1, to: sqlite3_destructor_type.self)
        for (index, value) in arguments.enumerated() {
            let bound = value.withCString { sqlite3_bind_text(statement, Int32(index + 1), $0, -1, transient) }
            guard bound == SQLITE_OK else {
                throw DatabaseError(code: bound, message: String(cString: sqlite3_errmsg(database)))
            }
        }
        var result: [[String]] = []
        while true {
            let step = sqlite3_step(statement)
            if step == SQLITE_DONE { return result }
            guard step == SQLITE_ROW else {
                throw DatabaseError(code: step, message: String(cString: sqlite3_errmsg(database)))
            }
            let values = try (0..<sqlite3_column_count(statement)).map { column -> String in
                guard let text = sqlite3_column_text(statement, column) else { throw CocoaError(.fileReadCorruptFile) }
                return String(cString: text)
            }
            result.append(values)
        }
    }
}

enum LocalSearch {
    static func normalize(_ text: String) -> String {
        text.folding(options: [.diacriticInsensitive, .caseInsensitive], locale: Locale(identifier: "en_US_POSIX"))
    }

    static func tokens(_ text: String) -> [String] {
        let separators = CharacterSet.alphanumerics.union(CharacterSet(charactersIn: ".:")).inverted
        return normalize(text).components(separatedBy: separators)
            .map { $0.trimmingCharacters(in: CharacterSet(charactersIn: ".:")) }.filter { !$0.isEmpty }
    }

    static func matchingIds(query: String, documents: [(String, String)]) -> Set<String> {
        let identifier = normalize(query.trimmingCharacters(in: .whitespacesAndNewlines))
        if let exact = documents.first(where: { normalize($0.0) == identifier }) { return [exact.0] }
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
