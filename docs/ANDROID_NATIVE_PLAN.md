# Native Android app plan

## Goal and boundaries

Build **Handball Rules Quiz** as a native Android app using Kotlin and Jetpack Compose. Preserve the capabilities and scoring of the native iOS app, while using Android conventions for navigation, system bars, dialogs, accessibility and responsive layouts. This is a clean Android implementation; do not wrap the Angular PWA in a WebView or restore Capacitor.

The app must include its complete learning dataset on first install and work without a network connection. The Angular PWA and GraphQL API remain separate, independently deployed products. Content updates for the first Android release ship through Google Play app updates. No accounts, ads, analytics, crash-reporting SDK, subscriptions, or runtime content sync are in scope.

Use application ID `io.github.kristofgilis.ihfrulesquiz` if the existing Play Console record uses that ID. Application IDs and signing identities are long-lived store identities: inspect the Play Console record before creating a new one, and preserve Play App Signing/upload-key lineage if already established.

## Product parity

Treat the current iOS implementation and `docs/NATIVE_PARITY.md` as the behavior baseline. Before implementation, resolve any mismatch against the Angular/API behavior and add shared fixtures where needed. Android must include:

- Home with quiz entry points, content edition and app version.
- Four-language UI and content: English, Dutch, French and Serbian.
- Ordered rule browsing, rule details/references, question practice by rule and across the full collection.
- Local question search, including identifiers, localized question/answer text, matching, ordering and typo fallback consistent with the agreed parity behavior.
- Multiple answer selection; calculate/recalculate score; wrong-question navigation; per-question and global reveal; reset behavior and reveal/scoring restrictions.
- Quiz setup for 10, 15, 20 or 30 questions, default 10, timed and untimed modes, 90 seconds per question, random questions and shuffled answers.
- Quiz progress, previous/next and swipe navigation, retained selections, exit confirmation, completion/expiry and result review. Hide source question numbers and answer letters during random quizzes, then restore identifiers during review without changing the shuffle.
- Existing scoring configuration and edge cases, including partial credit, negative scores and all-answer guessing penalties.
- Persisted language/theme settings and recoverable active quiz state. Timed quizzes use a deadline that remains correct through backgrounding and process death.
- In-app privacy, support and license information in all four languages; external policy/support/email actions may require connectivity.

## Android-native design

Use a Material 3 visual system consistent with the app's navy, blue, white and gold palette. Reuse the app's own handball/checkmark artwork, not IHF marks. Match the current iOS screens as closely as possible: reuse their hierarchy, screen grouping, card shapes, spacing, gradients, typography sizes and content placement. Keep Android-native navigation, control icons, switches, menus, dialogs, keyboard behavior and system bars.

Use a bottom navigation bar on compact screens and an adaptive navigation rail or drawer on larger screens. Use the Android system back gesture, predictive back where supported, native dialogs/sheets, status/navigation bar insets, keyboard behavior, edge-to-edge layout and standard touch targets. Test light, dark and system appearance, font scaling, TalkBack, landscape/tablet layouts and narrow phones.

Proposed initial top-level destinations: Home, Practice, Rules and Search. Settings is reached from a standard toolbar action. Keep this grouping aligned with iOS, including its Practice landing page and inline question-count/timer controls on Home and Practice.

## Architecture and data

- **Language/UI:** Kotlin, Jetpack Compose and Material 3; use the current stable Android Gradle Plugin/Kotlin/Compose versions at project creation and pin them through the Gradle version catalog/wrapper.
- **Architecture:** presentation, domain and data layers. Compose screens consume ViewModels/state holders; domain logic remains independent of Android UI; repositories are the interface to local content/preferences.
- **Content database:** use Android's platform SQLite APIs to read the existing reviewed database read-only, matching the iOS storage model. Generate the bundled database from the same portable source (`native/content.json` and deterministic content tools); do not hand-maintain Kotlin copies. The Android app copies a new database into private storage only when its bundled content hash changes, using a temporary file and replacement so an interrupted update can be recovered from the APK asset.
- **Preferences/session:** persist language, theme and active quiz snapshots separately from the immutable content database, keyed to the content hash. The initial implementation can use app-private preferences; move larger state to DataStore if it grows. Expire or safely discard incompatible sessions after a content update.
- **Search/scoring/randomization:** local-only domain services with deterministic seeded fixtures for tests. Share JSON fixtures and documented semantics with iOS; implement Kotlin separately.
- **Localization:** Android resource catalogs for interface strings, plus the localized bundled learning content. Map Android Serbian locale variants explicitly and validate Unicode/scripts, long labels and fallback behavior.
- **Networking:** no HTTP/GraphQL client in the Android learning path. Core app startup, content, search, practice, quiz and score must make zero network requests.

The existing generated SQLite artifact is about 7 MB and already contains ordered localized rules/questions, references, a cross-language search index and the manifest/scoring configuration. It is copied as a prebuilt Android asset and opened read-only, avoiding Room schema duplication and first-run JSON import. The generator verifies the source snapshot/database before copying it and records the content hash used to refresh the private copy.

## Repository and CI

Create a standalone Gradle project under `android/` in the UI repository, leaving Angular/PWA paths and web deployment independent. Add a version catalog, Gradle wrapper, application module, Compose UI tests and an Android-specific build workflow. Keep signing credentials in GitHub Actions secrets or local secure storage; never check them into source control.

CI should run content-pack validation, Kotlin unit tests, lint/static checks, debug and release compilation, and emulator instrumentation/UI tests on at least one phone emulator. Add a tablet/large-screen emulator job if runner capacity permits. Build the release artifact as a signed Android App Bundle (AAB); retain mapping files and build metadata for each release.

Keep Android build/test workflows independent from macOS/Xcode workflows. Android can be developed and built on Windows/Linux or hosted Linux CI; lack of a Mac is not a blocker for this phase.

## Milestones and gates

### 1. Verify store identity and product baseline

Inspect the Google Play Console for the existing app record, application ID, owner verification, Play App Signing status, upload-key lineage, testing/account gates and any draft release. Compare the iOS parity table and content pack with current source behavior. Record the minimum Android version/device scope after checking the expected audience and Play policy at implementation time.

**Gate:** application ID and signing path are known; every feature maps to a native Android flow; content schema and expected fixtures are agreed.

### 2. Create Android project and offline foundation

Create the Gradle/Compose project and CI. Add theme, navigation shell, localization resources, SQLite content access, persistent preferences and bundled content. Establish startup recovery, migrations and content hash checks.

**Gate:** clean install in airplane mode opens all four locales; bundled rules/questions load; settings persist; no network client is used by core flows.

### 3. Implement browsing and search

Build Home, Rules, rule detail, question practice, local Search and references using native Android layouts. Implement matching behavior and verify localized text, Serbian script and accessibility labels.

**Gate:** rule/practice/search journeys work offline and representative search results match agreed fixtures.

### 4. Implement quizzes and scoring

Build setup, timed/untimed session, random selection/shuffle, selection state, progress/back/forward/swipe, exit confirmation, timer/deadline, score computation, results and answer review. Persist/restore sessions without reshuffling; pin them to the content hash.

**Gate:** shared scoring/session fixtures pass, including expiry after background/process death and every parity checklist item.

### 5. Polish, accessibility and upgrade checks

Implement Settings, theme behavior, in-app Privacy/Support/Licenses, app metadata and the native icon/splash. Review compact and large screens, font scaling, TalkBack, keyboard behavior, system back, light/dark/system and translations with fluent reviewers. Test install/upgrade paths and offline operation.

**Gate:** visual/accessibility review is complete; fresh install and upgrade both work offline; no unplanned data collection or network calls are observed.

### 6. Play testing and release

Confirm Play Console's current developer/account verification and testing requirements; requirements can vary by account and may change. Create a signed AAB using the established Play App Signing path, upload to an internal testing track, test on a supported physical Android device, then proceed through any required closed-testing period and production access. Complete the store listing, screenshots, content rating, target audience, data-safety form, privacy URL and declarations against the actual binary. Submit only after owner review.

**Gate:** internal/required testing is complete; Play declarations match observed app behavior; release is approved by the app owner.

### 7. Retire obsolete container support

Once the Android and iOS native apps are established and the user approves ending support for old Capacitor installations, remove obsolete Capacitor-related API CORS origins and any remaining container-specific code/config. Keep the web PWA's Azure/API infrastructure and workflows.

**Gate:** web, iOS and Android build/release independently, with no active Capacitor integration and no supported old container relying on its origins.

## Testing and acceptance checklist

- Fresh install with network blocked: Home, all four locales, rules, practice, search, quiz, score, results and in-app Privacy/Support all work.
- Database: deterministic export, checksums, locale counts, referential integrity, upgrade, failed import recovery and compatibility behavior.
- Scoring: no selection, exact, partial, incorrect, all-selected penalty, negative/nonnegative modes and zero/edge cases match shared fixtures.
- Quiz: each question count, timed/untimed, expiry, shuffle reproducibility, answer retention, previous/next/swipe, exit confirmation, process death, deadline and result review.
- Practice: individual/global reveal, reset, score/reveal restrictions, rule-based and full collection, wrong-question navigation.
- Search: identifiers, phrases, accents/case, punctuation, Serbian scripts and representative typo fallback per locale.
- UI: system back/predictive back, insets, keyboard, compact/large screens, tablet, orientation, TalkBack, font scaling, light/dark/system and long translations.
- Upgrade: install over any existing Play record/build and verify application ID, signing lineage, preserved compatible settings and immediate offline access.
- Release: signed AAB, increasing version code, reproducible content provenance, screenshots and privacy/data-safety declarations checked against the final code.

## Open inputs and risks

- Google Play draft created on 27 October 2026: **Handball Rules Quiz**, package `io.github.kristofgilis.ihfrulesquiz`, app ID `4976385006116525227`, default English (US), App, Free. Package availability was confirmed before creation; there were no prior apps or uploaded signing keys in this account. The owner approved the program-policy, Play App Signing and export declarations. Nothing has been published.
- No physical Android device is currently available. Emulator CI can cover development, but physical-device acceptance and any Play Console device-verification requirement need a viable path before release. The previously mentioned device is over ten years old and is unlikely to satisfy current requirements.
- Human translation review is still useful for all four languages.
- Google Play policies, target API deadlines, account testing requirements and data-safety questions must be checked against current official guidance immediately before submission.
- Content changes are coupled to store release cadence for the initial app; optional signed offline-safe content updates are a separate future project.

## Implementation status and next actions

The visual reference is iOS build 21 and the current SwiftUI sources. Android uses the same hero, quiz setup, study tiles, rules, answer cards, score ring, results, search states and grouped Settings structure, with platform-native controls and navigation. Home launches directly from its visible 10/15/20/30 selection and timed switch; saved sessions offer Resume/Review and Discard in the same place as iOS.

The initial Kotlin/Compose implementation is in `android/`: shared iOS branding with an adaptive Android launcher icon and animated court, compact bottom navigation and a wide-screen navigation rail, localized Home/Rules/Practice/Search/Settings, local multilingual typo-tolerant search with exact identifier matches and result-to-practice navigation, question/rule practice with score and wrong-question jumps, randomized/timed quizzes with swipe navigation and review, private quiz restoration, and in-app Privacy/Support. Navigation and quiz/practice UI state survive the localized catalog reload; Android Back returns from root tabs to Home. Privacy and Support use the four-language native information catalog with Android-specific Google Play wording. It opens the validated shared SQLite asset with Android's platform SQLite API. `scripts/prepare-android-content.py` prepares the offline content, information and branding assets and the independent Android workflow uses the checksum-pinned Gradle wrapper to run `lintDebug`, `assembleDebug`, `assembleRelease` and `bundleRelease` on Linux. It can also be started manually. The compatible Compose 1.9.4/Material 3 1.4.0 BOM is pinned to keep the API 36/AGP 8.13.2 toolchain coherent.

Next actions:

1. Complete the Android emulator journeys and record the visual/behavior review. Local debug and unsigned release compilation and Android lint pass; first launch in airplane mode opens the bundled Home content. A 20-question timed quiz starts with 30 minutes; selected answers survive swipe/previous navigation, and native exit confirmation returns to Home. Grouped Settings, exact-number search and practice are reviewed in the emulator. A correct single-question attempt calculates 100.00%, keeps the percentage on one line, and scrolls to the score on the first tap. The repository includes the Gradle wrapper, and an isolated local JDK/SDK was used for verification.
2. Review compact/wide layouts, TalkBack labels, large text, system bar colors, long translations and the end-to-end flows on phone/tablet emulators.
3. Add domain and instrumentation coverage when authorized, and reconcile scoring/search against the shared iOS/API fixtures. No Android automated tests have been added or run in this implementation.
4. The first upload key and four GitHub signing secrets are configured, and Google accepted signed 1.0 (code 1). The internal-release draft is saved without rollout. Minimum Android is 7.0 (API 24), required by the enabled automatic Play protection. Complete tester selection, release notes and owner-approved internal rollout; account/device acceptance still needs final verification. The dashboard explicitly requires a closed test with at least 12 testers enrolled continuously for 14 days before applying for production access.
5. Arrange a supported physical Android device for acceptance, then complete the Play listing, current data-safety/content-rating declarations, internal/required testing and owner-approved release.
