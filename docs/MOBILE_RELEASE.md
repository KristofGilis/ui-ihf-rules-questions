# Native mobile development and release

The iOS app is written in Swift/SwiftUI and reads a bundled SQLite database. It has no runtime API dependency. The Angular PWA is still deployed separately to Azure and uses the existing GraphQL API and persisted Apollo cache. Native Android is the next milestone after iOS acceptance; the previous Android WebView shell has been removed.

## Identity and baseline

- Name: IHF Rules Quiz
- Bundle/application ID: `io.github.kristofgilis.ihfrulesquiz`
- Apple Team: `XKF5T9N38M`
- Existing App Store Connect record: Apple ID `6826826667`, SKU `ihf-rules-quiz-ios`
- Previous container implementation: commit `fed17f7`; recover it from Git history if needed.
- iOS minimum: 15.0, retained from the previous app. iPhone and iPad remain enabled.

This branch prepares the native implementation. It does not upload a new TestFlight build, change store declarations, or submit the app. Existing TestFlight builds contain the previous implementation until the native archive is uploaded.

## Build and verify

Open `ios/App/App.xcodeproj` in Xcode on macOS and select the App scheme. The project pins GRDB 7.0.0 through Swift Package Manager; resolving dependencies requires internet on the build machine. The installed app uses its bundled database without connectivity.

```sh
python3 scripts/native-content.py --check
python3 scripts/test_native_content.py
python3 scripts/generate-native-ios-project.py
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
```

The **Native iOS checks** workflow validates bundled content and tests the Swift app on an available iPhone simulator. It needs no Angular build, npm installation or running API. Native tests cover the bundled locales, scoring, search, deterministic selection and quiz restoration/timer expiry. Physical-device and visual acceptance remain required.

Run `npm ci`, `npm run lint`, and `npm run build:web` for the PWA. Web service-worker behavior remains enabled in production. Native workflows and web releases are independent.

## Bundled content

`native/content.json` is the reviewed portable snapshot. Its manifest records content and scoring source commits, individual language editions, schema version and complete scoring parameters. `ios/App/App/Resources/content.sqlite` is generated from it. Both files are committed so a normal checkout builds without sibling repositories or network content requests.

Update content from clean, reviewed checkouts:

```sh
python3 scripts/native-content.py --source ../ihf_rules_questions --api ../api-ihf-rules-questions
python3 scripts/native-content.py --check
python3 scripts/test_native_content.py
```

`native/strings.json` adds native UI translations to existing web translations during import. The exporter keeps each locale's questions/correctness separate and builds cross-language search documents. It rejects duplicate questions, broken rule relationships, empty native strings and questions with no correct answer. Review content changes and source revisions before committing regenerated artifacts. The bundled database is read-only and is replaced with app updates; preferences and saved sessions are stored separately. Saved sessions tied to a different content hash are discarded safely without a download.

## TestFlight

The existing **Upload iOS build to TestFlight** workflow archives the Swift project directly, using the configured six Actions secrets. It keeps the existing bundle ID/profile and record. Choose a unique build number greater than every existing upload; build 4 is the proposed next value and must be checked at upload time. The workflow uploads but does not submit for App Review.

Before uploading a release candidate, pass simulator CI and review the parity checklist. Before App Review, test on the available iPhone, capture new screenshots, review all languages and privacy/export declarations, and verify upgrading from the installed container app. Old WebView storage is not imported in this first native implementation: bundled content remains immediately available; locale/theme are initialized from system defaults until selected in native settings. Communicate that one-time settings reset during acceptance.

## Acceptance

1. Fresh install with no network: home, all four languages, rules, practice, search, quizzes, scoring, results and privacy/support links are visible (opening external links needs connectivity).
2. Select 10/15/20/30 questions; verify timed/untimed mode, multi-select, navigation, expiry, exit confirmation and results.
3. Verify question/rule practice, individual/global answer reveal, score/reset rules and wrong-question navigation.
4. Background/terminate/relaunch: quiz selections persist; timed sessions expire according to the absolute deadline. New content safely retires a saved session from the previous pack.
5. Check accessibility text, VoiceOver, safe areas, default tab bar/back gestures, small/large screens, iPad and orientation.
6. Confirm no network requests during normal native use. Email, GitHub and other external links deliberately leave the app and require connectivity.

Privacy/support are external links in Settings, alongside a direct email contact; there are no dedicated native privacy/support screens. Apple requires accessible policy/support links, and Google requires in-app policy access. The public privacy/support page sources now distinguish the offline native client from the website; deploy and verify those URLs before store submission. No analytics, ads or additional crash services are included.

## Android and API infrastructure

Implement Android with Kotlin/Compose and Room after iOS acceptance, using the same content snapshot and parity fixtures. Preserve package ID and signing lineage if a Play record/key already exists. Check actual account/device verification and track requirements before release and test on a supported physical device.

Retain API CORS origins `capacitor://localhost` and `https://localhost` while supporting old installed container builds. Remove them only after that support window ends. The API and Azure web origin remain necessary for the PWA.

See [NATIVE_REBUILD_PLAN.md](NATIVE_REBUILD_PLAN.md) for the approved scope and [NATIVE_PARITY.md](NATIVE_PARITY.md) for implementation and acceptance status.
