# Fully offline native mobile rebuild plan

## 1. Product goal and scope

Build IHF Rules Quiz again as a native iOS app first, followed by native Android. Preserve the existing functionality and scoring, with freedom to redesign the layout, screen structure, visual style, and navigation. Use platform controls, including the default system tab bar.

All core functionality must work on the first launch in airplane mode. This replaces the earlier requirement that allowed an initial online download. Bundle every supported language, all rule/question/answer content, references, correct answers, scoring configuration, UI translations, and required visual assets. Content updates initially arrive through app-store releases. A runtime API connection and content sync are not part of the first native release.

Continue the Angular PWA and existing GraphQL API for the website. Preserve the current app name, permission to use IHF content, and the existing store identities: `io.github.kristofgilis.ihfrulesquiz` on both platforms. Reuse the existing Apple app record; use the existing Google record if one has been created.

External actions such as downloading the app, receiving store updates, opening a support website, or sending email still require connectivity. Privacy and Support are external Settings links, with an email contact link. Dedicated in-app privacy/support screens are omitted; these external actions require connectivity.

## 2. Functional parity baseline

| Area              | Required behavior                                                                                                                                                                                                                                                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home              | Entry points to quizzes and study material; readable app/build number and selected language's content edition. Its arrangement may be completely redesigned.                                                                                                                                                                             |
| Rules             | Browse rule groups in the correct order, open a rule, access its associated questions, translations and rule references. Preserve all current content; do not imply that references contain full rulebook text unless it exists in the source.                                                                                           |
| Question practice | Browse questions, select multiple answers, calculate a score, review wrong questions, reset practice, reveal answers individually or globally, and apply the current restrictions/reset behavior when revealing answers. Preserve practice within a rule as well as the full question collection.                                        |
| Search            | Search questions locally in the selected language; preserve supported matching and navigation to results and rule references. Document differences between current server and offline search before choosing local matching/ranking.                                                                                                     |
| Quiz setup        | Preserve question counts 10, 15, 20 and 30, default 10, and timed/untimed modes.                                                                                                                                                                                                                                                         |
| Active quiz       | Random question selection and answer shuffling, multiple answer selection, progress, previous/next navigation and swipe equivalents, answer retention while navigating, exit confirmation, and completion. Preserve the current 90-seconds-per-question timing configuration and expiry behavior after inspecting the exact timer rules. |
| Results           | Preserve scoring rules, correct/wrong counts, percentage, completion time when applicable, per-question answer review, references, and starting another quiz.                                                                                                                                                                            |
| Settings          | English, Dutch, French and Serbian; persistent light/dark/system theme and language override. Replace browser/sidebar settings with relevant native presentation. Replace online-sync controls with content edition/about information and an offline reset only if needed.                                                               |
| Privacy/support   | Accessible Settings links to the public privacy policy, support page and email; bundled acknowledgements.                                                                                                                                                                                                                                |
| Offline           | Fresh install, language switching, search, practice, timed quizzes, scoring, results and subsequent launches all work without networking.                                                                                                                                                                                                |

Freeze a detailed behavior checklist from the current source before porting. Preserve user outcomes and intentional rules; web layout workarounds and accidental bugs are not parity requirements. Accounts, cloud history, achievements, ads, subscriptions and other new product features are outside this rebuild.

## 3. New layout and native experience

Recommended starting navigation: four system tabs, Home, Practice, Rules and Search. Home offers quick quiz setup; Practice contains question study and quiz entry. Settings opens from a standard toolbar button. Adjust labels/grouping during design review while keeping every capability discoverable.

Design a focused quiz screen with the question, large selectable answer rows, progress, timer when enabled, clear previous/next/finish actions and an exit warning. Present results as a score summary followed by answer review. Prefer native lists, sheets, alerts, pickers, search fields, typography, keyboard behavior and back gestures.

Prepare layouts for home/setup, rules/detail, question practice, search/results, active quiz, results, settings and about/privacy/support. Review light/dark appearance, long translations, large accessibility text and small iPhones before implementing all screens. Use native adaptations on Android rather than forcing identical screen composition on both platforms.

## 4. Architecture and project structure

| Platform | Implementation                                                                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| iOS      | Swift, SwiftUI, platform navigation/tab controls, local storage using the platform SQLite library directly, native localization resources and local preferences. |
| Android  | Kotlin, Jetpack Compose, platform navigation, Room over SQLite, native localization resources and DataStore preferences.                                         |

Choose compatible stable dependency/toolchain versions during setup. Confirm minimum OS support against the current audience before selecting APIs; the present iOS project targets iOS 15, so raising that minimum is a deliberate product decision. Verify tablet scope and orientation requirements at the same point.

Organize each app into presentation, domain logic and local data layers. Views access repositories; repositories read the device database; quiz/scoring/search logic has no network dependency. Keep downloadable content separate from preferences and active quiz state. Share content format, behavior specifications and test fixtures across platforms; implement Swift and Kotlin code separately.

Keep native projects in `ios/` and `android/` in the existing UI repository, with independent build workflows and a shared content-generation area. Keep the Angular files in their current web structure. The native first release needs no GraphQL client or native-to-web bridge.

References supporting the stack: [Apple native navigation](https://developer.apple.com/documentation/swiftui/navigation), [SQLite interface](https://sqlite.org/capi3ref.html), [Android Compose guidance](https://android-developers.googleblog.com/2026/05/android-ui-development-is-compose-first.html), and [Room persistence](https://developer.android.com/training/data-storage/room).

## 5. Bundled content and offline behavior

The `ihf_rules_questions` repository already contains per-language rule/question/answer JSON, correctness flags, references and language-specific edition files. Use a pinned revision of this content as the release input. Confirm that it matches the API's published data; incorporate any API transformations before exporting.

Create a deterministic build-time exporter that produces one portable content pack for both apps. Include stable identifiers, ordering, translations, correctness, references, scoring configuration, language-specific editions, source commit, schema version and checksum. Keep source content centralized rather than maintaining manual Swift and Kotlin copies. Obtain scoring parameters from a documented authoritative source aligned with the API/domain implementation.

Validate the pack before shipping: expected languages and record counts, unique IDs, references, answer/question relationships, missing translations, valid correct-answer sets and scoring fields. Language editions can differ; do not silently combine mismatched questions or claim all translations share one edition. Define a visible fallback for genuinely missing translations.

On first launch, open a bundled database or import the bundled pack transactionally into local storage. Choose the packaging method after measuring content size and import/search performance. A failed/interrupted import must recover entirely from bundled resources. Store preferences separately and exclude reproducible content from unnecessary backups where supported.

Run random selection, search, practice and scoring locally. Establish common fixtures from the current API/domain tests and frontend local scorer; reconcile discrepancies instead of choosing one silently. Build a local search index with language-appropriate case, accent and Serbian-script handling and validate representative queries against current behavior.

Show app version separately from each language's content edition. Installing a new app version installs a new validated content pack without erasing settings. Pin an active quiz to its content version, or define an explicit safe restart if migration makes continuation impossible. Stale content remains usable offline; there is no mandatory expiry, server check or re-download.

## 6. Content updates

For the initial native releases, ship content changes with App Store/Google Play updates. CI pins and validates a content revision, generates the pack, runs parity checks and embeds it in the release. The app always includes a complete usable dataset. Content changes can therefore require a store release and its review cycle.

An optional online content updater can be designed later if that delay becomes a problem. It would require signed/versioned packs, compatibility checks, atomic installation and rollback, and must never be necessary for normal offline use. It is outside the initial scope.

## 7. Delivery milestones

### A. Baseline, design and content contract

Deliver the detailed parity checklist, scoring/timer/search specifications, initial native screen layouts, OS/device decisions, pinned content source and pack schema. Measure the bundled dataset and identify translation gaps. Establish macOS/Xcode access or a workable hosted build workflow. Verify existing app identifiers, signing assets and store record access.

**Gate:** every current capability is mapped to a native flow, content can be generated reproducibly, and release inputs are known.

### B. Remove Capacitor and establish native iOS

Record the last working Capacitor revision in Git before replacement. Remove Capacitor core/platform/CLI dependencies, the Capgo navigation plugin, `capacitor.config.ts`, `cap sync` scripts, generated WebView projects, native bridge code, CSS offsets and obsolete Capacitor assets/scripts. Replace mobile upload/verification workflows with native jobs; remove native-runtime conditions from Angular and restore ordinary web service-worker setup. Retain the PWA, its web assets and Azure deployment.

Create the clean SwiftUI project in `ios/` with the existing bundle ID, team and store signing identity. Preserve useful icons/branding as ordinary platform assets. Keep credentials outside source control. Establish build/version metadata and native simulator CI. Prepare Android migration documentation; remove its old Capacitor shell without requiring an Android replacement at this milestone.

**Gate:** web build succeeds, native iOS shell compiles, no active Capacitor build/runtime integration remains, and the prior implementation is recoverable through Git. This cleanup happens early; it does not depend on completing Android or both store launches.

### C. iOS offline foundation

Bundle the pack and all UI resources; implement local storage/import, migrations, preferences, localization, native tabs/navigation, Home and rule/question browsing. Add local search and dataset version display. Verify initialization recovery and upgrade behavior.

**Gate:** a fresh install opens in airplane mode, all four languages and bundled content work, and core journeys issue no network requests.

### D. iOS complete parity and redesigned screens

Complete full-collection and rule-based practice, reveal/reset behavior, configurable quizzes, timer, shuffling, local scoring, results/review, settings, privacy and support. Handle background/foreground transitions without timer drift or lost selections. Review native back/swipe behavior and accessibility. Finish translation and visual reviews.

**Gate:** each parity item passes; scoring fixtures match the agreed behavior; the final layout works on small/large screens and with larger text.

### E. iOS TestFlight and release

Adapt the existing signing secrets and macOS upload workflow to archive the Swift project directly. Increase build numbers and reuse the current App Store Connect record. Test on the available iPhone through TestFlight, including upgrade from the Capacitor build. Preserve language/theme if a small safe migration is possible; never make old WebView cache or a network resync necessary because the content is now bundled.

Capture fresh screenshots, update descriptions to explain offline operation, and check privacy/content/export declarations against the final code. Keep privacy/support details available in Settings. Submit the reviewed candidate through the existing app record and track feedback. A prior TestFlight build is a comparison/recovery reference; a production correction generally needs another build/version rather than assuming a store downgrade.

**Gate:** native iOS is accepted for release and real-device offline/upgrade checks pass.

### F. Android native app

After iOS acceptance, build Kotlin/Compose in `android/` using the same content pack, scoring/search specifications and parity fixtures. Implement Room, preferences, native navigation, local search, practice/quiz/results, four languages and privacy/support links. Adapt system back, font scaling and TalkBack to Android.

Use emulator CI, then validate on a supported physical device. Recheck Play Console's actual account/device verification and testing requirements at release time. Phone-contact verification alone does not establish that every console gate is cleared. Preserve the application ID and any existing signing lineage; configure a backed-up upload key and Play App Signing if still required. Create signed AABs and progress through the account's applicable testing tracks before production.

**Gate:** the same feature/offline suite passes on Android, and applicable Play account/testing requirements are satisfied.

### G. Final infrastructure cleanup

Update README, mobile release docs, onboarding and CI paths for the native projects. Search for obsolete runtime dependencies and build references. Remove Capacitor CORS origins from Azure/API only once support for installed Capacitor builds has ended; old installed binaries can still need them even though source code has been removed. Retain API/web infrastructure needed by the PWA. Keep native releases independent of Angular web deployment.

**Gate:** web, iOS and Android build/release independently, with no active Capacitor integration.

## 8. Acceptance and testing

- Fresh install with networking blocked: every core flow works in each of the four languages, including the first quiz and its score.
- Local content: validate integrity, source revision, per-language editions, references, import interruption, recovery, migrations and new-pack installation.
- Scoring: verify no answers, partial/multiple selections, wrong answers, selecting every answer, penalties, edge cases and online-API reference fixtures prepared during development.
- Quiz: verify all four counts, timed/untimed flow, expiry, shuffling, navigation, answer retention, exit confirmation and background/foreground behavior.
- Practice: verify individual/global reveal, scoring restrictions, resetting, rule-based practice and review navigation.
- Search: check representative queries and matching across English, Dutch, French and Serbian; measure startup/search memory and latency on supported devices.
- UI: inspect native bars/back gestures, safe areas, keyboards, small screens, long strings, light/dark/system appearance, accessibility text, VoiceOver and TalkBack.
- Upgrade: install over the old Capacitor app and over earlier native content versions, verifying app identity, settings handling and immediate offline usability.
- Release: verify signed archives/AABs, increasing build identifiers, screenshots, privacy answers and absence of unexpected network traffic during core use.

## 9. Completion and sequencing

The rebuild is complete when iOS and Android provide the existing user capabilities through native interfaces, work from the first launch without internet, preserve the store identities, and have independent supported release pipelines. The Angular PWA remains available as the web application. Capacitor is removed from active source and workflows during milestone B, with its last implementation preserved in Git history.

Implementation order: baseline/design/content pack -> Capacitor removal and iOS shell -> fully offline iOS data/browsing/search -> full iOS practice/quiz parity -> TestFlight/iOS release -> native Android -> final infrastructure cleanup.

Implementation is proceeding on the feature branch; see NATIVE_PARITY.md for current implementation and acceptance status. Store changes remain a later release step.
