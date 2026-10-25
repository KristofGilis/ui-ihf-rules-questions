# Native iOS parity and acceptance

The implementation follows the approved fully offline rebuild. Source baseline: UI commit `fed17f7`; content/scoring revisions are recorded in `native/content.json`. Every content language currently includes 19 rule groups and 432 questions. Search includes question numbers and question/answer phrases across all languages, matching the current website's documented cross-language behavior.

| Capability             | Implementation                                                                                                          | Acceptance still required               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Home and version       | Native lists, quiz entry, content edition, app version/build                                                            | Visual/device review                    |
| Navigation             | Four SwiftUI system tabs, standard navigation, settings sheet                                                           | Gestures, safe areas, iPad              |
| Rules                  | Rule-ordered list and associated question practice                                                                      | All-language content review             |
| Full question practice | Multi-select, calculate, wrong-question links, reset                                                                    | Device journey                          |
| Reveal                 | Per-question and global reveal; clears selections/score; prevents scoring while revealed                                | Device journey                          |
| Search                 | Numbers, all languages, partial words, typo fallback, local execution                                                   | Ranking/latency comparison with server  |
| Setup                  | 10, 15, 20, 30 questions, default 10, timed/untimed                                                                     | Device journey                          |
| Quiz                   | Unique random selection, repeatable shuffle, previous/next, swipe, answer retention, exit warning                       | VoiceOver/gesture review                |
| Timing                 | Total duration = question count times 90 seconds; auto-complete at deadline                                             | Background/termination device test      |
| Results                | Exact-question percentage, correct/wrong counts, points, duration, selected/correct answers, references, new quiz entry | Device journey                          |
| Persistence            | Native language/theme; saved active quiz; hash change discards incompatible session                                     | Upgrade/device test                     |
| Languages              | en/nl/fr/srb content and UI, standard sr locale mapping                                                                 | Human translation review                |
| Offline                | Complete SQLite content and policy bundled; no network data client                                                      | Airplane-mode acceptance                |
| Privacy/support        | Settings links to public privacy/support links and email; offline acknowledgements                                      | Public policy/store declarations review |
| CI                     | Content checks, Swift simulator tests, direct signed archive workflow                                                   | Successful remote run required          |

## Deliberate behavior improvements

- A first install needs no sync. All content, search and scoring are local.
- Timed quizzes use an absolute deadline and remain correct across backgrounding. Active sessions survive process termination if the content hash matches.
- Browser/sidebar preferences are replaced with native layout. The web UI retains its own sidebar.
- Native search uses strict substring matching, then the current local-search edit-distance fallback (one edit for 3–4 character terms, two for longer terms). Result order follows content order; server-specific full-text ranking is not reproduced. Validate representative queries before release.
- Existing WebView language/theme storage is not imported. Native settings start with system language/appearance and are then persisted. No user content download or account data is lost because all learning content is bundled and the app has no accounts.

## Automated checks

Python tests validate the exported snapshot, invalid-content rejection, database equivalence, repeatable export and cross-language search content. Swift tests verify all locales, scoring configurations and penalties, local search normalization/typos, seeded selection and timed-session restore/expiry. These do not replace physical-device, visual or translation acceptance.

## Delivery state

Capacitor removal and iOS implementation are on the feature branch. Android native implementation, store upload/submission, public policy update and physical-device acceptance are subsequent milestones. Preserve the last working container revision in Git and the existing store/signing identities.
