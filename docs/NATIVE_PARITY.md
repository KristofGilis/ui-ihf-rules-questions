# Native iOS parity and acceptance

The implementation follows the approved fully offline rebuild. Source baseline: UI commit `fed17f7`; content/scoring revisions are recorded in `native/content.json`. Every content language currently includes 19 rule groups and 432 questions. Search includes question numbers and question/answer phrases across all languages, matching the current website's documented cross-language behavior.

| Capability             | Implementation                                                                                                 | Acceptance still required                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Home and version       | Playful IHF blue/gold cards, quiz entry, content edition, app version/build                                    | Visual/device review                       |
| Navigation             | Four SwiftUI system tabs, standard navigation, settings sheet                                                  | Gestures, safe areas, iPad                 |
| Rules                  | Rule-ordered list and associated question practice                                                             | All-language content review                |
| Full question practice | Multi-select, calculate, wrong-question links, reset                                                           | Device journey                             |
| Reveal                 | Per-question and global reveal; clears selections/score; prevents scoring while revealed                       | Device journey                             |
| Search                 | Numbers, all languages, partial words, typo fallback, local execution                                          | Ranking/latency comparison with server     |
| Setup                  | 10, 15, 20, 30 questions, default 10, timed/untimed                                                            | Device journey                             |
| Quiz                   | Unique random selection, repeatable shuffle, previous/next, swipe, answer retention, exit warning              | VoiceOver/gesture review                   |
| Timing                 | Total duration = question count times 90 seconds; auto-complete at deadline                                    | Background/termination device test         |
| Results                | Score percentage, correct/wrong counts, points, duration, selected/correct answers, references, new quiz entry | Device journey                             |
| Persistence            | Native language/theme; saved active quiz; hash change discards incompatible session                            | Upgrade/device test                        |
| Languages              | en/nl/fr/srb content and UI, standard sr locale mapping                                                        | Human translation review                   |
| Offline                | Complete SQLite learning content bundled; no network data client                                               | Airplane-mode acceptance                   |
| Privacy/support        | Native offline pages in all four languages, email contact inside them, app copyright/content credits           | Public policy/store declarations review    |
| CI                     | Content checks, Swift simulator tests, direct signed archive workflow                                          | Passed; physical-device acceptance remains |

## Deliberate behavior improvements

- A first install needs no sync. All content, search and scoring are local.
- Timed quizzes use an absolute deadline and remain correct across backgrounding. Active sessions survive process termination if the content hash matches.
- Browser/sidebar preferences are replaced with native layout. The web UI retains its own sidebar.
- Creating a random quiz keeps the setup controls stable until the full-screen presentation finishes. Repeated start taps are disabled; saved-quiz actions appear after dismissal instead of flashing during launch.
- Active random quizzes show progress but hide question-bank numbers and answer letters, including in accessibility labels. Review restores source identifiers beside the answers in the same shuffled order. Selection, navigation, completion and saved-session restoration do not reshuffle questions or answers.
- Appearance uses an explicit window-level UIKit override, including presented content. System clears the override to `unspecified`; Light/Dark force the chosen style. CI starts in system Dark mode and checks System → Light → System without closing Settings.
- Saved quizzes show a neutral restart icon next to Resume/Review. Discard remains behind its confirmation alert; no red inline label is shown on Home after returning from a quiz.
- Native search uses strict substring matching, then the current local-search edit-distance fallback (one edit for 3–4 character terms, two for longer terms). Result order follows content order; server-specific full-text ranking is not reproduced. Validate representative queries before release.
- Existing WebView language/theme storage is not imported. Native settings start with system language/appearance and are then persisted. No user content download or account data is lost because all learning content is bundled and the app has no accounts.

## Automated checks

Python tests validate the exported snapshot, invalid-content rejection, database equivalence, repeatable export and cross-language search content. Swift tests verify all locales, scoring configurations and penalties, local search normalization/typos, seeded question/answer order and timed-session restore/expiry. Selection, navigation, completion and restoration must preserve the saved order.

The quiz-launch UI regression holds the full-screen cover closed in Debug so it can inspect the post-creation setup state that normally appears only during the first presentation frames. It checks that Start remains visible but disabled, with no Resume/Discard controls; release builds exclude this hook. The normal quiz journey checks that saved controls return after dismissal without inline discard text, active quizzes omit source identifiers, and review restores them in the exact displayed answer order. CI boots each device in system Dark appearance. A separate Settings regression measures the visible sheet through System (dark) → Light → System and subsequent Dark/Light/System changes without dismissing it. These checks do not replace physical-device, visual or translation acceptance.

## Delivery state

Verified build **1.0 (21)** (`00e324d`) passed ten Swift tests and five UI tests on each of iPhone and 13-inch iPad. The expanded suite at `9e98f8f` passed ten Swift and six UI tests per device (32 tests) with identical Release app sources, adding Dutch/French store journeys. Tests cover court animation, one-tap score visibility, SQLite filtering/bound parameters, native offline Privacy/Support, stable quiz launch, hidden/restored identifiers in the same shuffled order, neutral saved-quiz controls, System (dark) → Light → System, native launch-storyboard appearances and the native Liquid Glass close button without an extra custom circle. Captures confirm the enlarged 40-point Home header logo and full app name on both devices. Content/export checks and Angular lint/build also passed. Apple confirmed `VALID` processing and `IN_BETA_TESTING` for Handball Rules Quiz Internal on 27 October 2026. [Upload and processing run](https://github.com/KristofGilis/ui-ihf-rules-questions/actions/runs/40504632670). The store draft now uses build 21 with four original screenshots per device in English, Dutch and French; all 24 images are processed.

The app links system SQLite directly and has no Swift Package dependencies. The separate Content source page is omitted; app copyright and content credits remain in Settings. The handball/checkmark artwork replaces the IHF mark, with light/dark icons and transparent Home header images. Native interface wording is revised in all four languages, with standard system typography on the Home hero. Interface catalogs are independent of the unchanged learning database, preserving existing saved quizzes. See `MOBILE_RELEASE.md` for current verification and delivery status.

Apple received version **1.0 (21)** on 27 October 2026 and reports **WAITING_FOR_REVIEW**. Manual release remains selected; no native public release has been performed. Website v2.22.0 deployed successfully, with both public policy/support routes and all four translated catalogs verified live. Android's native Kotlin/Compose foundation is now in `android/`. Local debug and unsigned release compilation and Android lint have passed using an isolated JDK 17/Gradle 8.13/SDK 36 toolchain; the debug app also opened on an Android emulator in airplane mode with the bundled content available. The Gradle wrapper pins its distribution checksum. Automated Android test coverage has not been added, and the full emulator journeys remain pending. The Android feature/physical-device acceptance, Apple's review outcome and final release gates remain open. Preserve the last working container revision in Git and the existing store/signing identities.
