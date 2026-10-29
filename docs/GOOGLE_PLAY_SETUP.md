# Google Play setup draft

Updated 29 October 2026. Internal release 1.0 (1) is active. The privacy-policy URL, unrestricted app access, no ads, Data safety, government, financial and health declarations, IARC ratings and target audience have been saved in Play Console. The English, Dutch, French and Serbian listing text and screenshots are saved as drafts. The owner approved the complete Alpha closed-test package, and all 18 changes were submitted on 29 October 2026. Google Play shows changes under review; automated checks run before review.

## App content

| Form               | Proposed response                                | Basis                                                                                                                       |
| ------------------ | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Privacy policy     | https://rulequestions.azurewebsites.net/privacy  | Existing multilingual public policy                                                                                         |
| App access         | All functionality available without restrictions | No login, membership, payment or location gate                                                                              |
| Ads                | No ads                                           | No ad SDK or ad placement                                                                                                   |
| Data safety        | No required user-data types collected or shared  | Fully local SQLite/preferences, no INTERNET permission, no analytics/crash/ad SDK; support email opens an external mail app |
| Government         | Not a government app                             | Independent sports study app                                                                                                |
| Financial features | No financial features                            | No payments, banking, credit, investments or financial advice                                                               |
| Health             | No health features                               | Handball rule education, no medical/fitness tracking                                                                        |
| Category           | Sports                                           | Matches iOS and app purpose                                                                                                 |
| Public contact     | kristof.gilis@outlook.be                         | Approved publisher support email                                                                                            |
| Website            | https://rulequestions.azurewebsites.net/         | Existing app website                                                                                                        |
| Audience           | 6–8, 9–12, 13–15, 16–17, 18+                     | Explicitly approved by owner; ages 5 and under excluded                                                                     |

Children are part of the intended audience, so Google's Families requirements apply. The app has no account, network permission, advertising, purchases, social features or user-generated content. The owner explicitly approved Google's child-law compliance declaration before it was saved. The app is not enrolled in Teacher Approved.

The owner approved and saved the IARC ratings: ESRB Everyone, PEGI 3, Brazil All Ages, USK All Ages and 3+ in the other displayed regions. These content ratings are separate from the intended audience.

Data safety was saved with no data collection and no sharing. The optional public Families-policy badge is off; this does not remove the obligation to follow the Families requirements.

The separate Advertising ID declaration was saved as No, with owner approval. The app and its dependencies do not use the Advertising ID.

Play Console's App content overview reports no declarations requiring attention. All four store listings now report that their required information is supplied. Sports is saved as the app category. The approved public support email and website are saved. The owner approved the four listing translations below for saving as drafts.

## Listing text

Name in all languages: **Handball Rules Quiz**.

### English (US)

Short description: Practise handball rules with quizzes, search and answer review

Study handball rules and test your knowledge with interactive quizzes. Choose timed or untimed practice, browse questions by rule, and review your answers after each quiz.

The app supports English, Dutch, French, and Serbian, with light and dark themes. Questions are included in the app, so browsing, searching, practice and quizzes work without a connection. No account is required.

### Dutch

Short description: Oefen de handbalspelregels met quizzen, zoeken en antwoordcontrole

Leer de handbalspelregels en test je kennis met interactieve quizzen. Oefen met of zonder tijdslimiet, bekijk vragen per spelregel en controleer je antwoorden na elke quiz.

De app is beschikbaar in het Nederlands, Engels, Frans en Servisch en heeft een lichte en donkere weergave. De vragen zijn inbegrepen: je kunt zonder internetverbinding vragen bekijken, zoeken, oefenen en quizzen maken. Je hebt geen account nodig.

### French

Short description: Révisez les règles du handball avec des quiz et vérifiez vos réponses

Révisez les règles du handball et testez vos connaissances avec des quiz interactifs. Entraînez-vous avec ou sans limite de temps, consultez les questions par règle et vérifiez vos réponses après chaque quiz.

L’app est disponible en français, anglais, néerlandais et serbe et propose une apparence claire ou sombre. Les questions sont incluses : vous pouvez les consulter, les rechercher, vous entraîner et faire des quiz sans connexion Internet. Aucun compte n’est nécessaire.

### Serbian

Short description: Вежбајте рукометна правила кроз квизове и проверу одговора

Учите рукометна правила и проверите своје знање кроз интерактивне квизове. Вежбајте са временским ограничењем или без њега, прегледајте питања по правилима и проверите своје одговоре после сваког квиза.

Апликација је доступна на српском, енглеском, холандском и француском језику, уз светлу и тамну тему. Питања су укључена у апликацију, па прегледање, претрага, вежбање и квизови раде без интернет везе. Није потребан кориснички налог.

## Remaining assets and review

The owner approved uploading `native/store/google-play/app-icon.png` (512 × 512) and `feature-graphic.png` (1024 × 500). Both use the existing native artwork, are opaque, and are below Google's size limits. Regenerate with `node scripts/generate-android-store-assets.mjs`. The app name is identical across locales, so the feature graphic can be shared without an English-only tagline.

All 48 native Android screenshots are saved in the listing drafts: four phone, four 7-inch tablet and four 10-inch tablet images for each language. The owner completed the remaining uploads. On 29 October, all twelve screenshot sets were verified in Play Console in Home → quiz → score → rules order, with no unsaved edits. Source images in `native/store/google-play/screenshots` are unmodified full-resolution captures from version 1.0 (1); their provenance and hashes are recorded in `screenshots/manifest.json`. Existing 1080 × 2400 development previews were not stretched or used as store assets.

The submitted package includes Alpha version 1.0 (1), four completed listings, declarations, worldwide test availability (177 countries/regions plus Rest of the world), the owner-approved tester Google Group and feedback contact. Managed publishing is off; the owner explicitly approved automatic availability to eligible closed testers after Google approval. Production remains unreleased. Twelve Testers recruitment is saved as a draft and approved for publication only once closed-test enrollment works. See docs/ANDROID_CLOSED_TEST.md for the group, recruitment listing and status.

The owner still needs to recruit testers. See `docs/ANDROID_CLOSED_TEST.md` for the separate closed-test requirement and an invitation draft. Uploads, completed declarations and store listing saves need owner approval; nothing here authorizes a closed-test or public rollout.

References: [target audience](https://support.google.com/googleplay/android-developer/answer/9867159?hl=en), [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469), [preview assets](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en).
