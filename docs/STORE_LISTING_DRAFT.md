# Store listing draft

The native app is named **Handball Rules Quiz**. Capture screenshots from the native apps; the existing PWA screenshots are reference material only.

**Branding:** the native app uses its own handball/checkmark artwork, with no IHF logo in its icon, header or launch screen. The earlier logo-specific hold is resolved. Website branding is separate.

**Submission preparation:** final store preparation is still open. Check `MOBILE_RELEASE.md` for verified delivery and test results. The last signed-in draft check on 26 October 2026 found version 1.0 Prepare for Submission, no attached review build, 0/10 iPhone and iPad screenshots, and review notes using the old app name. Build **1.0 (18)** is verified for internal TestFlight on 27 October. It includes the refined interface, native offline information pages, system SQLite, stable quiz launch, anonymous random quizzes with numbered review, corrected System appearance and neutral saved-quiz restart control. Eight original English iPhone/iPad screenshots are packaged in ignored `native/previews/store-screenshots-build18.zip`; they have not been uploaded to App Store Connect. The live subtitle was previously “Based on IHF Regulations”; the copy below remains a draft.

## Shared English copy

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

These four captures are available for both iPhone and 13-inch iPad in the build 18 package. Additional Settings/results captures are available in the local simulator previews if needed.

Use the exact feature wording supported by the tested native build. Do not describe the app as official or affiliated with IHF unless that relationship is documented.

## Apple review notes draft

The app is an interactive handball rules quiz. Its main features are timed and untimed quizzes, rules browsing, search, answer review, language selection, and light/dark themes. Privacy and Support are bundled native pages reached from Settings in each language; reading them requires no network access. Selecting the contact email opens the system email service. Question content is bundled with the app and normal use requires no network connection. No account or credentials are required.

Update App Store Connect's existing notes to match this native build and add tested device/OS versions. This file is a draft, not confirmation that store metadata has been saved.

## Required facts to verify before submission

- Publisher identity and final store declarations
- Recheck that the public privacy and support URLs still resolve before submission
- Recheck logging before submission: on 24 October 2026, application and HTTP logging were disabled on both Azure App Services, neither app had Azure Monitor diagnostic settings, and Azure SQL auditing was disabled. These settings were not retaining request logs. Update all four privacy-policy translations if logging changes.
- Third-party SDK data collection and any crash reporting added after this review
- Store age ratings and target audience
- Final screenshots, app version, and release notes in each language offered on the store
