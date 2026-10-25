import SwiftUI

@main
struct IHFRulesQuizApp: App {
    @StateObject private var state = AppState()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(state)
                .environment(\.locale, Locale(identifier: state.language == "srb" ? "sr" : state.language))
                .preferredColorScheme(state.colorScheme)
                .tint(Color(red: 0.08, green: 0.47, blue: 0.68))
        }
    }
}

struct RootView: View {
    @EnvironmentObject private var app: AppState
    @State private var settings = false
    @State private var quiz = false

    var body: some View {
        Group {
            if app.loadFailed {
                VStack(spacing: 24) {
                    Image(systemName: "exclamationmark.triangle").font(.largeTitle)
                    Text(app.text("native.load_error"))
                    Button(app.text("native.retry")) { app.load() }.buttonStyle(.borderedProminent)
                    Link("kristof.gilis@outlook.be", destination: URL(string: "mailto:kristof.gilis@outlook.be")!)
                }.padding()
            } else {
                TabView {
                    feature(title: "navigation.home") { HomeView(openQuiz: { quiz = true }) }
                        .tabItem { Label(app.text("navigation.home"), systemImage: "house") }
                    feature(title: "native.practice") { PracticeHomeView(openQuiz: { quiz = true }) }
                        .tabItem { Label(app.text("native.practice"), systemImage: "checklist") }
                    feature(title: "navigation.rules") { RulesView() }
                        .tabItem { Label(app.text("navigation.rules"), systemImage: "book") }
                    feature(title: "navigation.search") { SearchView() }
                        .tabItem { Label(app.text("navigation.search"), systemImage: "magnifyingglass") }
                }
                .id(app.language)
            }
        }
        .sheet(isPresented: $settings) {
            NavigationView {
                SettingsView().toolbar { ToolbarItem(placement: .confirmationAction) {
                    Button(app.text("native.close")) { settings = false }
                } }
            }.navigationViewStyle(.stack)
        }
        .fullScreenCover(isPresented: $quiz) {
            if let session = app.session { QuizView(session: session, close: { quiz = false }) }
        }
    }

    private func feature<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        NavigationView {
            content().navigationTitle(app.text(title)).toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button { settings = true } label: { Image(systemName: "gearshape") }
                        .accessibilityLabel(app.text("settings.title"))
                }
            }
        }.navigationViewStyle(.stack)
    }
}

struct HomeView: View {
    @EnvironmentObject private var app: AppState
    let openQuiz: () -> Void

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 12) {
                    Text("IHF Rules Quiz").font(.largeTitle.bold()).accessibilityAddTraits(.isHeader)
                    Text(app.text("home.hero_description")).font(.body).foregroundStyle(.secondary)
                    Label(app.text("native.offline"), systemImage: "checkmark.shield").font(.subheadline)
                }.padding(.vertical, 12)
            }
            QuizSetupSection(openQuiz: openQuiz)
            Section {
                NavigationLink(destination: PracticeView(questions: app.questions)) {
                    Label(app.text("native.study"), systemImage: "text.book.closed")
                }
                NavigationLink(destination: RulesView()) {
                    Label(app.text("rules.title"), systemImage: "book")
                }
                NavigationLink(destination: SearchView()) {
                    Label(app.text("search.title"), systemImage: "magnifyingglass")
                }
            }
            Section(header: Text(app.text("native.content"))) {
                Text(app.edition)
                Text(app.text("native.questions", ["count": String(app.questions.count)]))
                Text(app.text("native.offline_details")).font(.footnote).foregroundStyle(.secondary)
            }
            Section {
                HStack {
                    Text(app.text("native.version"))
                    Spacer()
                    Text(app.version).foregroundStyle(.secondary).textSelection(.enabled)
                }
            }
        }.listStyle(.insetGrouped)
    }
}

struct QuizSetupSection: View {
    @EnvironmentObject private var app: AppState
    @State private var count = 10
    @State private var timed = false
    @State private var replace = false
    let openQuiz: () -> Void

    var body: some View {
        Section(header: Text(app.text("home.quiz_card.title"))) {
            Picker(app.text("home.quiz_card.count"), selection: $count) {
                ForEach([10, 15, 20, 30], id: \.self) { Text(String($0)).tag($0) }
            }
            Toggle(app.text("home.quiz_card.timed_mode"), isOn: $timed)
            if let session = app.session {
                Button(app.text(session.isComplete ? "native.review" : "native.resume"), action: openQuiz)
                Button(app.text("native.discard"), role: .destructive) { replace = true }
            } else {
                Button { app.startQuiz(count: count, timed: timed); openQuiz() } label: {
                    Label(app.text("home.quiz_card.button"), systemImage: "play.fill").frame(maxWidth: .infinity)
                }.buttonStyle(.borderedProminent).padding(.vertical, 6)
            }
        }
        .alert(app.text("quiz.leave_title"), isPresented: $replace) {
            Button(app.text("native.discard"), role: .destructive) { app.discardQuiz() }
            Button(app.text("quiz.leave_cancel"), role: .cancel) {}
        } message: { Text(app.text("quiz.leave_warning")) }
    }
}

struct PracticeHomeView: View {
    @EnvironmentObject private var app: AppState
    let openQuiz: () -> Void
    var body: some View {
        List {
            QuizSetupSection(openQuiz: openQuiz)
            Section {
                NavigationLink(destination: PracticeView(questions: app.questions)) {
                    Label(app.text("home.all_questions_card.title"), systemImage: "text.book.closed")
                }
                Text(app.text("native.questions", ["count": String(app.questions.count)])).foregroundStyle(.secondary)
            }
        }.listStyle(.insetGrouped)
    }
}

struct RulesView: View {
    @EnvironmentObject private var app: AppState
    var body: some View {
        List(app.rules) { rule in
            NavigationLink(destination: PracticeView(questions: app.questions.filter { $0.ruleId == rule.id }, title: "\(rule.number) · \(rule.name)")) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(rule.number) · \(rule.name)").font(.headline)
                    Text(app.text("native.questions", ["count": String(app.questions.filter { $0.ruleId == rule.id }.count)]))
                        .font(.subheadline).foregroundStyle(.secondary)
                }.padding(.vertical, 4)
            }
        }.navigationTitle(app.text("rules.title"))
    }
}
