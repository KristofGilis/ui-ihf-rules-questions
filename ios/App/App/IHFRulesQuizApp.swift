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
                .tint(Playful.blue)
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
                    EmptyPlayState(title: "IHF Rules Quiz", detail: app.text("native.load_error"), symbol: "exclamationmark.triangle")
                    PrimaryAction(title: app.text("native.retry")) { app.load() }
                    Link("kristof.gilis@outlook.be", destination: URL(string: "mailto:kristof.gilis@outlook.be")!)
                }.padding(24).background(PlayfulBackground())
            } else {
                TabView {
                    feature(title: "IHF Rules Quiz", literal: true) { HomeView(openQuiz: { quiz = true }) }
                        .tabItem { Label(app.text("navigation.home"), systemImage: "house.fill") }
                    feature(title: "native.practice") { PracticeHomeView(openQuiz: { quiz = true }) }
                        .tabItem { Label(app.text("native.practice"), systemImage: "bolt.fill") }
                    feature(title: "navigation.rules") { RulesView() }
                        .tabItem { Label(app.text("navigation.rules"), systemImage: "book.closed.fill") }
                    feature(title: "navigation.search") { SearchView() }
                        .tabItem { Label(app.text("navigation.search"), systemImage: "magnifyingglass") }
                }.id(app.language)
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

    private func feature<Content: View>(title: String, literal: Bool = false, @ViewBuilder content: () -> Content) -> some View {
        NavigationView {
            content().navigationTitle(literal ? title : app.text(title)).navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button { settings = true } label: {
                            Image(systemName: "slider.horizontal.3").font(.subheadline.weight(.semibold))
                                .frame(width: 36, height: 36).background(Playful.blue.opacity(0.08)).clipShape(Circle())
                        }.accessibilityLabel(app.text("settings.title")).accessibilityIdentifier("settings.open")
                    }
                }
        }.navigationViewStyle(.stack)
    }
}

struct HomeView: View {
    @EnvironmentObject private var app: AppState
    @Environment(\.dynamicTypeSize) private var typeSize
    let openQuiz: () -> Void
    private var columns: [GridItem] { Array(repeating: GridItem(.flexible(), alignment: .top), count: typeSize.isAccessibilitySize ? 1 : 2) }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 25) {
                HomeHero()
                QuizSetupSection(openQuiz: openQuiz)
                SectionHeading(title: app.text("native.explore"), detail: app.text("native.explore_detail"))
                LazyVGrid(columns: columns, alignment: .leading, spacing: 14) {
                    NavigationLink(destination: PracticeView(questions: app.questions)) {
                        FeatureTile(title: app.text("native.study"), detail: app.text("native.questions", ["count": String(app.questions.count)]), symbol: "rectangle.stack.fill", color: Playful.navy)
                    }.buttonStyle(PressableStyle()).accessibilityIdentifier("home.study")
                    NavigationLink(destination: RulesView()) {
                        FeatureTile(title: app.text("rules.title"), detail: app.text("native.rule_count", ["count": String(app.rules.count)]), symbol: "book.closed.fill", color: Playful.gold)
                    }.buttonStyle(PressableStyle()).accessibilityIdentifier("home.rules")
                }
                HStack(alignment: .top, spacing: 11) {
                    Image(systemName: "shippingbox.fill").foregroundColor(Playful.blue).padding(.top, 2)
                    VStack(alignment: .leading, spacing: 5) {
                        Text(app.text("native.content")).font(.system(.caption, design: .rounded).bold())
                        Text(app.edition).font(.caption).foregroundStyle(.secondary)
                    }
                    Spacer(minLength: 0)
                }.padding(.horizontal, 5)
                Text("\(app.text("native.version")) \(app.version)")
                    .font(.caption2).foregroundStyle(.secondary).frame(maxWidth: .infinity)
            }.padding(20).padding(.bottom, 16).frame(maxWidth: 760)
                .frame(maxWidth: .infinity)
        }.background(PlayfulBackground())
    }
}

struct HomeHero: View {
    @EnvironmentObject private var app: AppState
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.dynamicTypeSize) private var typeSize
    @State private var floating = false

    var body: some View {
        VStack(alignment: .leading, spacing: 21) {
            HStack(alignment: .top, spacing: 8) {
                VStack(alignment: .leading, spacing: 11) {
                    Text(app.text("native.hero_eyebrow")).font(.system(.caption2, design: .rounded).weight(.heavy)).tracking(2)
                        .foregroundColor(.white.opacity(0.76))
                    Text(app.text("native.hero_title")).font(.system(.largeTitle, design: .rounded).weight(.black))
                        .foregroundColor(.white).fixedSize(horizontal: false, vertical: true)
                        .accessibilityAddTraits(.isHeader)
                }.frame(maxWidth: .infinity, alignment: .leading)
                if !typeSize.isAccessibilitySize {
                    HandballCourtMark().frame(width: 68, height: 136)
                        .offset(y: floating ? -3 : 2)
                        .padding(.leading, 12)
                        .frame(width: 90, height: 136).accessibilityHidden(true)
                }
            }
        }.padding(24).frame(maxWidth: .infinity, alignment: .leading)
            .background(LinearGradient(colors: [Playful.buttonBlue, Playful.heroNavy], startPoint: .topLeading, endPoint: .bottomTrailing))
            .clipShape(RoundedRectangle(cornerRadius: 31, style: .continuous))
            .onAppear {
                if !reduceMotion && !ProcessInfo.processInfo.arguments.contains("-ui-testing-reset") {
                    withAnimation(.easeInOut(duration: 3).repeatForever(autoreverses: true)) { floating = true }
                }
            }
            .onChange(of: reduceMotion) { value in if value { floating = false } }
    }
}

struct QuizSetupSection: View {
    @EnvironmentObject private var app: AppState
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var count = 10
    @State private var timed = false
    @State private var replace = false
    @Namespace private var choice
    let openQuiz: () -> Void

    var body: some View {
        PaperCard {
            VStack(alignment: .leading, spacing: 16) {
                HStack(alignment: .top, spacing: 12) {
                    Image(systemName: "bolt.fill").font(.title3).foregroundColor(Playful.gold)
                        .frame(width: 45, height: 45).background(Playful.gold.opacity(0.12)).clipShape(RoundedRectangle(cornerRadius: 16))
                    VStack(alignment: .leading, spacing: 4) {
                        Text(app.text("home.quiz_card.title")).font(.system(.title2, design: .rounded).weight(.heavy))
                        Text(app.text("native.quiz_invite")).font(.subheadline).foregroundStyle(.secondary)
                    }
                    Spacer(minLength: 0)
                }
                Text(app.text("home.quiz_card.count")).font(.system(.subheadline, design: .rounded).weight(.bold))
                HStack(spacing: 9) {
                    ForEach([10, 15, 20, 30], id: \.self) { value in
                        Button {
                            withAnimation(reduceMotion ? nil : Playful.spring) { count = value }
                        } label: {
                            Text(String(value)).font(.system(.title3, design: .rounded).weight(.heavy))
                                .frame(maxWidth: .infinity).padding(.vertical, 15)
                                .foregroundColor(count == value ? .white : .primary)
                                .background {
                                    if count == value {
                                        RoundedRectangle(cornerRadius: 17).fill(Playful.buttonBlue).matchedGeometryEffect(id: "count", in: choice)
                                    } else { RoundedRectangle(cornerRadius: 17).fill(Playful.background) }
                                }
                        }.buttonStyle(PressableStyle()).accessibilityLabel(app.text("native.questions", ["count": String(value)]))
                            .accessibilityAddTraits(count == value ? .isSelected : [])
                    }
                }
                Toggle(isOn: $timed) {
                    HStack(spacing: 10) {
                        Image(systemName: timed ? "timer" : "clock").foregroundColor(Playful.navy)
                        VStack(alignment: .leading, spacing: 3) {
                            Text(app.text("native.timed_label")).font(.system(.subheadline, design: .rounded).bold())
                            Text(app.text("native.timed_detail")).font(.caption).foregroundStyle(.secondary)
                        }
                    }
                }.tint(Playful.blue)
                if let session = app.session {
                    PrimaryAction(title: app.text(session.isComplete ? "native.review" : "native.resume"), symbol: "play.fill", action: openQuiz)
                    Button(app.text("native.discard"), role: .destructive) { replace = true }.font(.subheadline)
                } else {
                    PrimaryAction(title: app.text("home.quiz_card.button"), symbol: "play.fill") {
                        app.startQuiz(count: count, timed: timed)
                        openQuiz()
                    }.accessibilityIdentifier("quiz.start")
                }
            }
        }.alert(app.text("quiz.leave_title"), isPresented: $replace) {
            Button(app.text("native.discard"), role: .destructive) { app.discardQuiz() }
            Button(app.text("quiz.leave_cancel"), role: .cancel) {}
        } message: { Text(app.text("quiz.leave_warning")) }
    }
}

struct PracticeHomeView: View {
    @EnvironmentObject private var app: AppState
    let openQuiz: () -> Void
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                SectionHeading(title: app.text("native.practice_title"), detail: app.text("native.practice_detail"))
                QuizSetupSection(openQuiz: openQuiz)
                NavigationLink(destination: PracticeView(questions: app.questions)) {
                    FeatureTile(title: app.text("native.study"), detail: app.text("questions.description"), symbol: "rectangle.stack.fill", color: Playful.navy)
                }.buttonStyle(PressableStyle())
                NavigationLink(destination: RulesView()) {
                    FeatureTile(title: app.text("rules.title"), detail: app.text("rule.description"), symbol: "book.closed.fill", color: Playful.gold)
                }.buttonStyle(PressableStyle())
            }.padding(20).padding(.bottom, 18).frame(maxWidth: 760).frame(maxWidth: .infinity)
        }.background(PlayfulBackground())
    }
}

struct RulesView: View {
    @EnvironmentObject private var app: AppState
    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 13) {
                SectionHeading(title: app.text("native.rules_title"), detail: app.text("rules.description")).padding(.bottom, 10)
                ForEach(Array(app.rules.enumerated()), id: \.element.id) { index, rule in
                    let accent = [Playful.blue, Playful.gold, Playful.navy][index % 3]
                    NavigationLink(destination: PracticeView(questions: app.questions.filter { $0.ruleId == rule.id }, title: "\(rule.number) · \(rule.name)")) {
                        PaperCard {
                            HStack(spacing: 16) {
                                Text(rule.number).font(.system(.title3, design: .rounded).weight(.black))
                                    .foregroundColor(accent).frame(minWidth: 52, minHeight: 52)
                                    .background(accent.opacity(0.12)).clipShape(RoundedRectangle(cornerRadius: 17))
                                VStack(alignment: .leading, spacing: 6) {
                                    Text(rule.name).font(.system(.headline, design: .rounded).bold()).foregroundColor(.primary)
                                    Text(app.text("native.questions", ["count": String(app.questions.filter { $0.ruleId == rule.id }.count)]))
                                        .font(.caption).foregroundStyle(.secondary)
                                }
                                Spacer(minLength: 0)
                                Image(systemName: "chevron.right").font(.caption.bold()).foregroundColor(accent)
                            }
                        }
                    }.buttonStyle(PressableStyle())
                }
            }.padding(20).padding(.bottom, 18).frame(maxWidth: 760).frame(maxWidth: .infinity)
        }.background(PlayfulBackground()).navigationTitle(app.text("rules.title")).navigationBarTitleDisplayMode(.inline)
    }
}
