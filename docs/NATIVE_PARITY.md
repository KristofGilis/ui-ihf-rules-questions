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
- Appearance preferences apply directly to the presented Settings sheet as well as the underlying app, so System/Light/Dark updates are visible without reopening Settings.
- Native search uses strict substring matching, then the current local-search edit-distance fallback (one edit for 3–4 character terms, two for longer terms). Result order follows content order; server-specific full-text ranking is not reproduced. Validate representative queries before release.
- Existing WebView language/theme storage is not imported. Native settings start with system language/appearance and are then persisted. No user content download or account data is lost because all learning content is bundled and the app has no accounts.

## Automated checks

Python tests validate the exported snapshot, invalid-content rejection, database equivalence, repeatable export and cross-language search content. Swift tests verify all locales, scoring configurations and penalties, local search normalization/typos, seeded question/answer order and timed-session restore/expiry. Selection, navigation, completion and restoration must preserve the saved order.

The quiz-launch UI regression holds the full-screen cover closed in Debug so it can inspect the post-creation setup state that normally appears only during the first presentation frames. It checks that Start remains visible but disabled, with no Resume/Discard controls; release builds exclude this hook. The normal quiz journey checks that saved controls return after dismissal, active quizzes omit source identifiers, and review restores them in the exact displayed answer order. A separate Settings regression measures the visible sheet's brightness through System/Dark/Light/System changes without dismissing it. These checks do not replace physical-device, visual or translation acceptance.

## Delivery state

Capacitor removal and the native iOS implementation are on the feature branch. Verified build **1.0 (15)** (`c709ac8`) passed ten Swift tests and three UI tests on each of iPhone and 13-inch iPad. Tests cover court animation, single-tap score visibility, SQLite filtering/bound parameters, and navigation to the native offline Privacy/Support pages. Content/export checks and Angular lint/build also passed. Apple confirmed `VALID` processing and `IN_BETA_TESTING` for the existing Handball Rules Quiz Internal group on 26 October 2026. [Upload and processing run](https://github.com/KristofGilis/ui-ihf-rules-questions/actions/runs/40380198316).

The app links system SQLite directly and has no Swift Package dependencies. The separate Content source page is omitted; app copyright and content credits remain in Settings. The current handball/checkmark artwork replaces the IHF mark, with light/dark app icons and transparent Home header images. Verified build **1.0 (16)** (`f2f402a`) revises native interface wording in all four languages and uses standard system typography on the Home hero. It passed ten Swift tests and three UI tests on each device, and Apple confirmed `VALID` and `IN_BETA_TESTING`. [Build 16 upload](https://github.com/KristofGilis/ui-ihf-rules-questions/actions/runs/40397131804). Interface catalogs are independent of the unchanged learning database, preserving existing saved quizzes. See `MOBILE_RELEASE.md` for current verification and delivery status.

Android native implementation, App Review submission, public policy deployment and physical-device acceptance remain subsequent milestones. Preserve the last working container revision in Git and the existing store/signing identities.
