# Native mobile development and release

The iOS app is written in Swift/SwiftUI and reads a bundled SQLite database. It has no runtime API dependency. The Angular PWA is still deployed separately to Azure and uses the existing GraphQL API and persisted Apollo cache. Native Android development has started in parallel with Apple's review; the previous Android WebView shell has been removed.

## Identity and baseline

- Native app name: Handball Rules Quiz
- Bundle/application ID: `io.github.kristofgilis.ihfrulesquiz`
- Apple Team: `XKF5T9N38M`
- Existing App Store Connect record: Apple ID `6826826667`, SKU `ihf-rules-quiz-ios`
- Previous container implementation: commit `fed17f7`; recover it from Git history if needed.
- iOS minimum: 15.0, retained from the previous app. iPhone and iPad remain enabled.

The original Bundle ID and SKU are retained as technical identifiers. Apple locks the SKU when the app record is created and the Bundle ID after the first build upload; the SKU is not customer-visible. The public app name is Handball Rules Quiz. See [Apple's app information reference](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information).

The latest verified native TestFlight build is **1.0 (21)** from `00e324d`. It enlarges the Home header logo from 30 to 40 points and uses tightly cropped Retina exports; the visible artwork is about 68% wider. It retains the native Liquid Glass close button, adaptive launch screen, System-theme fix, neutral saved-quiz restart control, stable quiz launch and numbered review in the same shuffled order. The learning database and saved-quiz content hash remain unchanged. Apple confirmed `VALID` processing and `IN_BETA_TESTING` for **Handball Rules Quiz Internal** on 27 October 2026 (build ID `3d8ad1c6-177c-47c5-b5ea-b0445f3b9f21`). [Upload and processing run](https://github.com/KristofGilis/ui-ihf-rules-questions/actions/runs/40504632670).

The uploaded revision passed **ten Swift tests and five UI tests on each of iPhone and 13-inch iPad** (30 tests), alongside content integrity, generated-project/catalog validation, Angular lint and production build checks. [Original simulator verification](https://github.com/KristofGilis/ui-ihf-rules-questions/actions/runs/40502616252). The expanded suite at `9e98f8f` passed **ten Swift tests and six UI tests per device** (32 tests), adding complete Dutch/French screenshot journeys; Release app sources remain identical to build 21. [Expanded verification](https://github.com/KristofGilis/ui-ihf-rules-questions/actions/runs/40509471779). Captures confirm the larger logo with the full app name visible, plus existing launch-storyboard, native close button, System-theme, saved-quiz and shuffled-review behavior. Twenty-four original English/Dutch/French screenshots are packaged in ignored `native/previews/store-screenshots-build21-multilingual.zip`, with dimensions, hashes and binary/capture revisions. Native public release has not been performed.

**App Review submission verified on 27 October:** Apple received version **1.0**, build **21**, at **13:53:12 UTC**. Both version and submission report **WAITING_FOR_REVIEW**. Submission ID: `f56fe8b1-866d-4d50-9806-8fc60b25c157`. **Manual release** remains selected, so review approval will not automatically publish the app. English (U.S.), Dutch and French names, descriptions, keywords, subtitles and policy URLs are saved. Sign-in is not required. All **24** original screenshots are processed: the same four-screen sequence per device in every language (Home → quiz → practice score → rules). Both masked and unmasked App Store icon assets for build 21 were fetched from Apple and visually verified as the new handball/checkmark artwork. The app selector displayed older artwork during preparation; it is not evidence of the selected build's icon.

Apple does not offer Serbian store metadata. Serbian remains fully supported inside the app and listed in its binary localizations; the English store listing provides the fallback. See [Apple's supported store languages](https://developer.apple.com/help/app-store-connect/reference/app-information/app-store-localizations/). **Website v2.22.0 deployed successfully** to Azure on 27 October. Both privacy/support routes return HTTP 200, their four live translation catalogs match the released sources, and browser checks confirm the new native/offline policy section, support content and removal of website Settings shortcuts. [Deployment](https://github.com/KristofGilis/ui-ihf-rules-questions/actions/runs/40512493071). Await Apple's review result before the separately authorized manual release.

Appearance uses a [UIKit window override](https://developer.apple.com/documentation/uikit/uiview/overrideuserinterfacestyle), cleared to `unspecified` for System so the whole hierarchy, including presented sheets, follows iOS. CI explicitly boots each simulator in Dark appearance to verify System → Light → System. The launch screen uses the native storyboard lifecycle with an adaptive background and no artificial delay. The quiz close button uses the standard system toolbar appearance and tap target, without an additional custom fill or shape. Physical-device acceptance and final store preparation remain open.

## Build and verify

Open `ios/App/App.xcodeproj` in Xcode on macOS and select the App scheme. The project links the platform SQLite library directly and has no Swift Package dependencies. The installed app opens its bundled database read-only; content loading makes no API calls.

```sh
python3 scripts/native-content.py --check
python3 scripts/test_native_content.py
python3 scripts/generate-native-ios-project.py
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
```

The **Native iOS checks** workflow validates bundled content and tests the Swift app on available iPhone and 13-inch iPad simulators. It needs no Angular build, npm installation or running API. Before running the UI suite locally, boot the chosen simulator and run `xcrun simctl ui booted appearance dark`; the system-theme regression requires this starting state. Native tests cover the bundled locales, scoring, search, deterministic selection and quiz restoration/timer expiry. Physical-device and visual acceptance remain required.

Run `npm ci`, `npm run lint`, and `npm run build:web` for the PWA. Web service-worker behavior remains enabled in production. Native workflows and web releases are independent.

## Android signing and Play draft

The Google Play app is **Handball Rules Quiz**, package `io.github.kristofgilis.ihfrulesquiz`, app ID `4976385006116525227`, created on 27 October 2026 with the owner's approval. It is Free, type App, default English (US). The initial bundle was rejected because automatic Play protection requires minimum SDK 24; the minimum is now **Android 7.0 (API 24)**, preserving that protection. Google accepted the rebuilt signed **1.0 (code 1)** bundle, showing API 24+, target 36, four screen layouts and four ABIs.

**Internal rollout verified on 27 October 2026 at 19:28 Brussels time:** track status **Active**, release **Available to internal testers**. The owner approved the rollout, the four-language notes in [Android release notes](ANDROID_RELEASE_NOTES.md), and the **Internal testers** list containing the owner's Google account. That list is selected and saved for this track. Google exposes the opt-in link in the Testers tab; testers must join using an eligible account. Play warns that propagation usually takes up to one hour and can take longer. Until store setup/review is complete, Google displays `io.github.kristofgilis.ihfrulesquiz (unreviewed)` as a temporary store name; the installed app retains Handball Rules Quiz. There are two nonblocking warnings: no deobfuscation mapping (release minification is not enabled) and no separate native debug-symbol archive for bundled library code. No public/closed-test release has been performed. The dashboard requires a separate closed test with at least 12 testers continuously enrolled for 14 days before requesting production access; internal testing does not start that period.

The accepted AAB has SHA-256 `2c9b71b94cd89b82910fc9e0ff3e30689fa2270e1c6fd4f9289bce766f81a887`. Local `lintRelease`, `bundleRelease` and signature verification pass. The upload certificate SHA-256 is `3E:0F:FB:18:9D:1C:03:4E:80:9F:FA:4D:4B:7B:18:10:60:B6:CF:FA:DF:42:F1:FB:86:53:82:B8:0A:90:5E:25`. A public certificate export is included in the ignored signing-backup directory. Later uploads must use version code 2 or higher.

The manual **Android signed bundle** workflow builds and verifies a signed AAB without uploading it to Google Play. It requires these repository secrets:

- `ANDROID_KEYSTORE_BASE64`: base64-encoded private upload keystore.
- `ANDROID_KEYSTORE_PASSWORD`: keystore password.
- `ANDROID_KEY_ALIAS`: upload key alias.
- `ANDROID_KEY_PASSWORD`: key password.

The workflow decodes the key only inside the runner's temporary directory, removes it on exit, and saves only the signed AAB as an artifact. Keep an owner-controlled backup of the keystore and passwords outside Git. Never commit them. No Google service-account credential is required for a manual Console upload. The owner approved creating the first upload key, saving all four secrets and uploading code 1 to the internal draft. The key was generated on 27 October 2026; all four repository-secret names were verified after encrypted API writes. The private local backup is in ignored `.local-release-secrets/android/`; copy it to an owner-controlled secure backup before removing this checkout.

Locally, set `ANDROID_KEYSTORE_PATH` to the absolute keystore path and the three password/alias environment variables above, then run `android/gradlew -p android lintRelease bundleRelease -PandroidVersionCode=1`. Builds without signing environment variables remain unsigned for ordinary verification. Every later Play upload needs a unique increasing version code. Signing does not imply authorization to upload, roll out or publish.

## App branding

The local native icon and Home header use the selected option A: a sweeping checkmark and stitched-panel handball in the app's navy, blue, white and gold palette. Both icon appearances are opaque, with white/slate and deep navy backgrounds. Home Screen appearance follows the system's icon setting; the header uses the transparent foreground in both app themes. Run `node scripts/compose-native-ball.mjs` followed by `node scripts/generate-native-branding.mjs --preview` to regenerate the composition, assets and comparison. This artwork replaces the previous IHF mark; check the verified TestFlight build status above for availability. See [native branding](../native/branding/README.md).

On regular-width iPadOS, the system's floating top tab bar displays text labels in the current native layout. The app supplies SF Symbols for every tab; iPhone displays icons and labels. A native sidebar is an alternative if both are wanted on iPad. See [Apple tab navigation guidance](https://developer.apple.com/documentation/swiftui/enhancing-your-app-content-with-tab-navigation).

## Court artwork

The home graphic uses metre coordinates from [IHF Rule 1, 1 July 2025](https://www.ihf.info/sites/default/files/2025-07/09A%20-%20Rules%20of%20the%20Game_Indoor%20Handball_E.pdf): a 40 × 20 m court, 3 m goal mouths, circular 6 m goal-area boundaries, 7 m marks, 9 m free-throw lines and a centred 4 m diameter throw-off circle. One uniform scale preserves these proportions in every container. The halfway line stops at the circle’s edges. Both goal areas have a subtle lighter blue fill. Line weights and dash cadence are enlarged for legibility at icon size; measured positions remain to scale. The native geometry test covers different container shapes, the 6 m boundaries, 9 m intersections and end-to-end symmetry. The court floats vertically through a 12-point range over a 4.4-second cycle, preserving its proportions. Its animation schedule pauses for Reduce Motion, hidden Home content and inactive app scenes, and resumes automatically. A separate UI test compares header screenshots with motion enabled; layout captures use `-ui-testing-static-layout`.

## Bundled content

`native/content.json` is the reviewed portable snapshot. Its manifest records content and scoring source commits, individual language editions, schema version and complete scoring parameters. `ios/App/App/OfflineContent/content.sqlite` is generated from it. Both files are committed so a normal checkout builds without sibling repositories or network content requests.

Update content from clean, reviewed checkouts:

```sh
python3 scripts/native-content.py --source ../ihf_rules_questions --api ../api-ihf-rules-questions
python3 scripts/native-content.py --check
python3 scripts/test_native_content.py
```

`native/strings.json` contains current native interface wording and overrides inherited web labels. The project generator copies it to `OfflineContent/InterfaceStrings.json`; `AppLocalization` merges this catalog with `AppInformation.json` for policy/support copy. These catalogs take precedence over the snapshot's historical UI strings. Wording updates therefore preserve the question database and saved-quiz content hash. CI verifies the generated catalog and tests complete locale keys and matching interpolation placeholders.

During a deliberate content import, the exporter also includes native UI strings in the portable snapshot. It keeps each locale's questions/correctness separate and builds cross-language search documents. It rejects duplicate questions, broken rule relationships, empty native strings and questions with no correct answer. Review content changes and source revisions before committing regenerated artifacts. The bundled database is read-only and is replaced with app updates; preferences and saved sessions are stored separately. Saved sessions tied to a different content hash are discarded safely without a download.

## TestFlight

The existing **Upload iOS build to TestFlight** workflow archives the Swift project directly, using the configured six Actions secrets. It keeps the existing bundle ID/profile and record. Choose a unique build number greater than every existing upload; build 21 is already uploaded. The next distinct candidate must use at least build 22. Check the latest upload before choosing a number. The workflow uploads but does not submit for App Review. `upload_build` controls whether to archive a new binary; disabling it allows managing an existing build. `enable_internal_testing` assigns a valid processed build to the existing **Handball Rules Quiz Internal** group and verifies Apple’s testing state through the App Store Connect API.

Before uploading a release candidate, pass simulator CI and review the parity checklist. Before App Review, test on the available iPhone, capture new screenshots, review all languages and privacy/export declarations, and verify upgrading from the installed container app. Old WebView storage is not imported in this first native implementation: bundled content remains immediately available; locale/theme are initialized from system defaults until selected in native settings. Communicate that one-time settings reset during acceptance.

## Acceptance

1. Fresh install with no network: home, all four languages, rules, practice, search, quizzes, scoring, results and privacy/support links are visible (opening external links needs connectivity).
2. Select 10/15/20/30 questions; verify timed/untimed mode, multi-select, navigation, expiry, exit confirmation and results.
3. Verify question/rule practice, individual/global answer reveal, score/reset rules and wrong-question navigation.
4. Background/terminate/relaunch: quiz selections persist; timed sessions expire according to the absolute deadline. New content safely retires a saved session from the previous pack.
5. Check accessibility text, VoiceOver, safe areas, default tab bar/back gestures, small/large screens, iPad and orientation.
6. Confirm no network requests during normal native use. Email, GitHub and other external links deliberately leave the app and require connectivity.

Privacy and Support are native pages opened from Settings and readable offline in all four languages. Email contact is inside those pages. A collapsed Licenses section separates app copyright from content acknowledgements; GRDB and its bundled notice have been removed because the app now uses platform SQLite directly. App-information translations are bundled separately from the question database so policy/support copy does not change the quiz content hash. There is no separate Content source page, source revision display or repository link. Apple requires accessible policy/support information in the app and public store URLs. The Angular `/privacy` and `/support` routes remain available; their Settings shortcuts have been removed at the operator’s request. The public privacy/support page sources now distinguish the offline native client from the website; deploy and verify those URLs before store submission. No analytics, ads or additional crash services are included.

## Android and API infrastructure

The Android implementation plan is in [ANDROID_NATIVE_PLAN.md](ANDROID_NATIVE_PLAN.md). A native Kotlin/Compose foundation now lives in `android/`: it reuses the shared bundled SQLite content, adds native navigation and the initial Home/Rules/Practice/Search/Settings/quiz flows, and has its own Linux build workflow. Continue implementation against the parity and acceptance gates in that plan.

Retain API CORS origins `capacitor://localhost` and `https://localhost` while supporting old installed container builds. Remove them only after that support window ends. The API and Azure web origin remain necessary for the PWA.

See [NATIVE_REBUILD_PLAN.md](NATIVE_REBUILD_PLAN.md) for the approved scope and [NATIVE_PARITY.md](NATIVE_PARITY.md) for implementation and acceptance status.
