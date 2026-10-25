# Store listing draft

The operator confirmed permission to use the IHF name, artwork, rules, and questions. Capture screenshots from the native apps; the existing PWA screenshots are reference material only.

## Shared English copy

**Verified privacy policy URL:** `https://rulequestions.azurewebsites.net/privacy`

**Verified support URL:** `https://rulequestions.azurewebsites.net/support`

**Name:** IHF Rules Quiz

**Apple subtitle:** Practice handball rules

**Apple keywords:** `handball,rules,quiz,referee,practice,questions,sport`

**Description:**

Study handball rules and test your knowledge with interactive quizzes. Choose timed or untimed practice, browse questions by rule, and review your answers after each quiz.

The app supports English, Dutch, French, and Serbian. Choose a light or dark theme and sync the question set for use without a connection. The first download requires internet access; after a successful sync, previously downloaded questions remain available offline.

**Suggested screenshot sequence:**

1. Quiz setup with timed and untimed choices
2. Question and answer interaction
3. Results and answer review
4. Rules browser
5. Offline sync status in Settings

Use the exact feature wording supported by the tested native build. Do not describe the app as official or affiliated with IHF unless that relationship is documented.

## Apple review notes draft

The app is an interactive handball rules quiz. Its main features are the quiz, rules browser, search, answer review, language selection, and an optional offline data sync. Content is provided by the GraphQL service at `https://api-ihf-rules-questions.azurewebsites.net/graphql`. A new installation needs a connection for its first content download. No account is required in the current app. Reviewers can open the app and use the quiz without credentials.

The App Store Connect review notes contain this information. Update them with device and OS versions tested and the verified offline behavior before submission.

## Required facts to verify before submission

- Publisher identity and rights to the name, artwork, rules, and questions (operator confirmed permission)
- Recheck that the public privacy and support URLs still resolve before submission
- Recheck logging before submission: on 24 October 2026, application and HTTP logging were disabled on both Azure App Services, neither app had Azure Monitor diagnostic settings, and Azure SQL auditing was disabled. These settings were not retaining request logs. Update all four privacy-policy translations if logging changes.
- Third-party SDK data collection and any crash reporting added after this review
- Store age ratings and target audience
- Final screenshots, app version, and release notes in each language offered on the store
