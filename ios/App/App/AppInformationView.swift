import SwiftUI

enum AppInformation {
    static let email = "kristof.gilis@outlook.be"
    static let copyright = "© 2026 Kristof Gilis"
}

private struct InformationPage<Content: View>: View {
    let title: String
    let content: Content

    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) { content }
                .padding(20).padding(.bottom, 20).frame(maxWidth: 760).frame(maxWidth: .infinity)
        }.background(PlayfulBackground()).navigationTitle(title).navigationBarTitleDisplayMode(.inline)
    }
}

private struct InformationSection<Content: View>: View {
    let title: String
    let content: Content

    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }

    var body: some View {
        PaperCard {
            VStack(alignment: .leading, spacing: 13) {
                Text(title).font(.system(.headline, design: .rounded).bold()).accessibilityAddTraits(.isHeader)
                content.font(.body).textSelection(.enabled)
            }.frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

private struct ContactLink: View {
    var body: some View {
        Link(destination: URL(string: "mailto:" + AppInformation.email)!) {
            Label(AppInformation.email, systemImage: "envelope.fill")
                .font(.subheadline.weight(.semibold)).fixedSize(horizontal: false, vertical: true)
        }.accessibilityIdentifier("information.email")
    }
}

struct PrivacyPolicyView: View {
    @EnvironmentObject private var app: AppState
    var body: some View {
        InformationPage(title: app.text("privacy.title")) {
            Text(app.text("info.privacy.updated")).font(.caption).foregroundStyle(.secondary)
            Text(app.text("info.privacy.intro")).accessibilityIdentifier("privacy.intro")
            InformationSection(title: app.text("privacy.device_label")) { Text(app.text("info.privacy.local")) }
            InformationSection(title: app.text("info.privacy.collection_heading")) { Text(app.text("info.privacy.collection")) }
            InformationSection(title: app.text("privacy.contact_label")) {
                Text(app.text("info.privacy.contact"))
                ContactLink()
            }
            InformationSection(title: app.text("privacy.retention_heading")) { Text(app.text("info.privacy.retention")) }
            InformationSection(title: app.text("privacy.rights_heading")) { Text(app.text("info.privacy.rights")) }
            InformationSection(title: app.text("privacy.changes_heading")) { Text(app.text("info.privacy.changes")) }
        }
    }
}

struct SupportView: View {
    @EnvironmentObject private var app: AppState
    var body: some View {
        InformationPage(title: app.text("support.title")) {
            Text(app.text("info.support.intro")).accessibilityIdentifier("support.intro")
            InformationSection(title: app.text("support.contact_heading")) {
                ContactLink()
                Text(app.text("support.contact_details"))
                Text(app.text("info.support.email")).font(.footnote).foregroundStyle(.secondary)
                Text("\(app.text("native.version")): \(app.version)").font(.footnote).foregroundStyle(.secondary)
            }
            InformationSection(title: app.text("support.offline_heading")) { Text(app.text("info.support.offline")) }
            InformationSection(title: app.text("support.content_heading")) { Text(app.text("support.content_details")) }
            NavigationLink(destination: PrivacyPolicyView()) {
                Label(app.text("privacy.title"), systemImage: "hand.raised.fill")
            }.accessibilityIdentifier("support.privacy")
        }
    }
}
