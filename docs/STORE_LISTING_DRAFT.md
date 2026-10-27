# Store listing draft

The native app is named **Handball Rules Quiz**. Capture screenshots from the native apps; the existing PWA screenshots are reference material only.

**Branding:** the native app uses its own handball/checkmark artwork, with no IHF logo in its icon, header or launch screen. The earlier logo-specific hold is resolved. Website branding is separate.

**Saved draft, 27 October 2026:** version 1.0 remains **Prepare for Submission**, with build **1.0 (20)** attached and **manual release** selected. The descriptions, keywords, names and subtitles below are saved in English (U.S.), Dutch and French; current native-app review notes are saved and sign-in is not required. All three localizations have the public privacy-policy URL. Twelve original build 20 screenshots are uploaded in explicit order and verified **COMPLETE** by Apple's API: four per device for English, and one localized Home capture per device for Dutch and French. Check `MOBILE_RELEASE.md` for binary verification and remaining release work. No App Review submission or public release has been made.

## Shared English copy

Build **21** is now available for internal TestFlight acceptance with a larger Home header logo. Twelve replacement screenshots are prepared in ignored `native/previews/store-screenshots-build21-multilingual.zip`. The saved store draft still uses build **20** and its verified screenshots; candidate replacement and App Review submission have not been performed.

**Verified privacy policy URL:** `https://rulequestions.azurewebsites.net/privacy`

**Verified support URL:** `https://rulequestions.azurewebsites.net/support`

**Name:** Handball Rules Quiz

**Apple subtitle:** Practice handball rules

**Apple keywords:** `handball,rules,quiz,referee,practice,questions,sport`

**Description:**

Study handball rules and test your knowledge with interactive quizzes. Choose timed or untimed practice, browse questions by rule, and review your answers after each quiz.

The app supports English, Dutch, French, and Serbian, with light and dark themes. Questions are included in the app, so browsing, searching, practice and quizzes work without a connection. No account is required.

**Suggested screenshot sequence:**

1. Home and quiz setup with timed and untimed choices (`home`)
2. Question and answer interaction (`quiz-selected`)
3. Calculated practice score (`perfect-practice-score`)
4. Rules browser (`rules`)

These four captures are available for both iPhone and 13-inch iPad in the build 20 package. Additional Settings/results captures are available in the local simulator previews if needed.

Use the exact feature wording supported by the tested native build. Do not describe the app as official or affiliated with IHF unless that relationship is documented.

## Localized store listings

Keep **Handball Rules Quiz** as the app name in each store localization. The app itself supports English, Dutch, French and Serbian (`CFBundleLocalizations`: `en`, `nl`, `fr`, `sr`). Apple's [supported store metadata languages](https://developer.apple.com/help/app-store-connect/reference/app-information/app-store-localizations/) include Dutch and French, but not Serbian. Keep Serbian available inside the app; use the English listing as its store fallback rather than labelling Serbian copy as another language.

The following copy was approved and saved on 27 October 2026. Original localized Home captures from build 20 are uploaded for both iPhone and iPad (`home-nl` and `home-french`). Additional localized quiz, score and rules captures can extend these listings later. The complete twelve-image package is ignored `native/previews/store-screenshots-build20-multilingual.zip`, with dimensions, hashes and exact binary source revision. Screenshots retain their original pixels.

### Dutch

**Subtitle:** Oefen de handbalspelregels

**Keywords:** `handbal,spelregels,quiz,scheidsrechter,oefenen,vragen,sport`

**Description:**

Leer de handbalspelregels en test je kennis met interactieve quizzen. Oefen met of zonder tijdslimiet, bekijk vragen per spelregel en controleer je antwoorden na elke quiz.

De app is beschikbaar in het Nederlands, Engels, Frans en Servisch en heeft een lichte en donkere weergave. De vragen zijn inbegrepen: je kunt zonder internetverbinding vragen bekijken, zoeken, oefenen en quizzen maken. Je hebt geen account nodig.

### French

**Subtitle:** Révisez les règles du handball

**Keywords:** `handball,règles,quiz,arbitre,révision,questions,sport`

**Description:**

Révisez les règles du handball et testez vos connaissances avec des quiz interactifs. Entraînez-vous avec ou sans limite de temps, consultez les questions par règle et vérifiez vos réponses après chaque quiz.

L’app est disponible en français, anglais, néerlandais et serbe et propose une apparence claire ou sombre. Les questions sont incluses : vous pouvez les consulter, les rechercher, vous entraîner et faire des quiz sans connexion Internet. Aucun compte n’est nécessaire.

## Apple review notes draft

The app is an interactive handball rules quiz. Its main features are timed and untimed quizzes, rules browsing, search, answer review, language selection, and light/dark themes. Privacy and Support are bundled native pages reached from Settings in each language; reading them requires no network access. Selecting the contact email opens the system email service. Question content is bundled with the app and normal use requires no network connection. No account or credentials are required.

These notes were saved and verified through Apple's API on 27 October 2026. The version is still a draft and has not been submitted for review.

## Required facts to verify before submission

- Publisher identity and final store declarations
- Public privacy and support URLs both returned HTTP 200 on 27 October 2026. Deploy and verify the updated multilingual page copy in PR #772 before submission; HTTP reachability alone does not confirm that source changes are live.
- Recheck logging before submission: on 24 October 2026, application and HTTP logging were disabled on both Azure App Services, neither app had Azure Monitor diagnostic settings, and Azure SQL auditing was disabled. These settings were not retaining request logs. Update all four privacy-policy translations if logging changes.
- Third-party SDK data collection and any crash reporting added after this review
- Store age ratings and target audience
- Final screenshots, app version, and release notes in each language offered on the store
