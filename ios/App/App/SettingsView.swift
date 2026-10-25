import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var app: AppState
    var body: some View {
        Form {
            Section(header: Text(app.text("settings.language_section"))) {
                Picker(app.text("settings.language_section"), selection: $app.language) {
                    ForEach(app.languages, id: \.0) { code, name in Text(name).tag(code) }
                }
            }
            Section(header: Text(app.text("settings.theme_section"))) {
                Picker(app.text("settings.theme_section"), selection: $app.appearance) {
                    ForEach(["system", "light", "dark"], id: \.self) { theme in
                        Text(app.text("theme.\(theme)")).tag(theme)
                    }
                }
            }
            Section(header: Text(app.text("native.content"))) {
                ForEach(app.languages, id: \.0) { code, name in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(name).font(.headline)
                        Text(app.repository?.manifest.locales[code]?.edition ?? "").font(.subheadline).foregroundStyle(.secondary)
                    }
                }
                Text(app.text("native.offline_details")).font(.footnote)
            }
            Section {
                Link(app.text("privacy.title"), destination: URL(string: "https://rulequestions.azurewebsites.net/privacy")!)
                Link(app.text("support.title"), destination: URL(string: "https://rulequestions.azurewebsites.net/support")!)
                Link("kristof.gilis@outlook.be", destination: URL(string: "mailto:kristof.gilis@outlook.be")!)
                NavigationLink(app.text("native.source"), destination: AcknowledgementsView())
                HStack {
                    Text(app.text("native.version"))
                    Spacer()
                    Text(app.version).foregroundStyle(.secondary)
                }
            }
        }.navigationTitle(app.text("settings.title"))
    }
}

struct AcknowledgementsView: View {
    @EnvironmentObject private var app: AppState

    var body: some View {
        List {
            Text(app.text("native.acknowledgements"))
            Text(app.repository?.manifest.sourceRevision ?? "").font(.caption.monospaced()).textSelection(.enabled)
            Link("GitHub", destination: URL(string: "https://github.com/KristofGilis/ihf_rules_questions")!)
            Text("GRDB.swift · SQLite").font(.headline)
            Text(notices).font(.footnote).textSelection(.enabled)
        }.navigationTitle(app.text("native.source"))
    }

    private var notices: String {
        guard let url = Bundle.main.url(forResource: "ThirdPartyNotices", withExtension: "txt", subdirectory: "OfflineContent") else { return "" }
        return (try? String(contentsOf: url, encoding: .utf8)) ?? ""
    }
}
