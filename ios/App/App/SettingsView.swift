import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var app: AppState
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 23) {
                SectionHeading(title: app.text("native.settings_title"), detail: app.text("settings.description"))
                PaperCard {
                    VStack(alignment: .leading, spacing: 20) {
                        Label(app.text("settings.language_section"), systemImage: "globe")
                            .font(.system(.headline, design: .rounded).bold()).foregroundColor(Playful.blue)
                        Picker(app.text("settings.language_section"), selection: $app.language) {
                            ForEach(app.languages, id: \.0) { code, name in Text(name).tag(code) }
                        }.pickerStyle(.menu).frame(maxWidth: .infinity, alignment: .leading)
                        Divider()
                        Label(app.text("settings.theme_section"), systemImage: "paintpalette.fill")
                            .font(.system(.headline, design: .rounded).bold()).foregroundColor(Playful.navy)
                        Picker(app.text("settings.theme_section"), selection: $app.appearance) {
                            ForEach(["system", "light", "dark"], id: \.self) { theme in Text(app.text("theme.\(theme)")).tag(theme) }
                        }.pickerStyle(.segmented).accessibilityIdentifier("settings.appearance")
                    }
                }
                PaperCard(tint: Playful.blue) {
                    VStack(alignment: .leading, spacing: 17) {
                        DisclosureGroup(app.text("native.content")) {
                            VStack(alignment: .leading, spacing: 14) {
                                ForEach(app.languages, id: \.0) { code, name in
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(name).font(.system(.subheadline, design: .rounded).bold())
                                        Text(app.repository?.manifest.locales[code]?.edition ?? "").font(.caption).foregroundStyle(.secondary)
                                    }
                                }
                            }.padding(.top, 14).frame(maxWidth: .infinity, alignment: .leading)
                        }.font(.subheadline.weight(.semibold))
                    }
                }
                PaperCard {
                    VStack(spacing: 19) {
                        NavigationLink(destination: PrivacyPolicyView()) {
                            settingsRow(app.text("privacy.title"), symbol: "hand.raised.fill", color: Playful.navy)
                        }.accessibilityIdentifier("settings.privacy")
                        Divider()
                        NavigationLink(destination: SupportView()) {
                            settingsRow(app.text("support.title"), symbol: "bubble.left.and.bubble.right.fill", color: Playful.blue)
                        }.accessibilityIdentifier("settings.support")
                        Divider()
                        DisclosureGroup(app.text("native.licenses")) {
                            VStack(alignment: .leading, spacing: 14) {
                                Text("Handball Rules Quiz").font(.subheadline.weight(.semibold))
                                Text(AppInformation.copyright).font(.footnote)
                                Text(app.text("native.acknowledgements")).font(.footnote)
                            }.padding(.top, 12).frame(maxWidth: .infinity, alignment: .leading)
                        }.font(.subheadline.weight(.semibold))
                    }.buttonStyle(PressableStyle())
                }
                HStack {
                    Text(app.text("native.version"))
                    Spacer()
                    Text(app.version).monospacedDigit()
                }.font(.caption).foregroundStyle(.secondary).padding(.horizontal, 6)
            }.padding(20).padding(.bottom, 20).frame(maxWidth: 760).frame(maxWidth: .infinity)
        }.background(PlayfulBackground()).navigationTitle(app.text("settings.title")).navigationBarTitleDisplayMode(.inline)
            .accessibilityIdentifier("settings.page")
    }

    private func settingsRow(_ title: String, symbol: String, color: Color) -> some View {
        HStack(spacing: 12) {
            Image(systemName: symbol).foregroundColor(color).frame(width: 27)
            Text(title).font(.subheadline.weight(.semibold)).foregroundColor(.primary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
            Image(systemName: "chevron.right").font(.caption.weight(.semibold)).foregroundStyle(.secondary)
        }.frame(maxWidth: .infinity, alignment: .leading).contentShape(Rectangle())
    }

}
