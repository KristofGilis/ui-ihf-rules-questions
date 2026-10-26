# Store listing draft

The native app is named **Handball Rules Quiz**. Capture screenshots from the native apps; the existing PWA screenshots are reference material only.

**Branding permission status, 26 October 2026:** the operator clarified that approval to use the IHF logo is not clear. TestFlight build 12 used the website's IHF artwork in white. The updated native artwork introduced for build 13 replaces that mark with the operator's selected handball/checkmark artwork. Website branding is unchanged. Do not use the earlier permission statement or an Apple review outcome as proof of IHF permission. Rights for the rule and question content remain a separate pre-submission check.

**Submission preparation:** no App Review submission has been authorized since the earlier TestFlight-only hold. Check `MOBILE_RELEASE.md` for verified delivery and test results. App Store Connect still contains the earlier “necessary rights” declaration; recheck it against the final candidate before submission. A signed-in check on 26 October 2026 confirmed version 1.0 remains Prepare for Submission, with no attached review build and 0/10 screenshots on both iPhone and iPad. Review notes still use the old IHF Rules Quiz name. Build **1.0 (16)** is verified for the existing internal TestFlight group and includes the refreshed typography/interface translations, native offline Privacy/Support pages and system SQLite. Eight original English iPhone/iPad screenshots are packaged in ignored `native/previews/store-screenshots-build16.zip`; they have not been uploaded to App Store Connect. The live English subtitle was previously “Based on IHF Regulations”; the copy below remains a draft.

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

These four captures are available for both iPhone and 13-inch iPad in the build 16 package. Additional Settings/results captures are available in the local simulator previews if needed.

Use the exact feature wording supported by the tested native build. Do not describe the app as official or affiliated with IHF unless that relationship is documented.

## Apple review notes draft

The app is an interactive handball rules quiz. Its main features are timed and untimed quizzes, rules browsing, search, answer review, language selection, and light/dark themes. Privacy and Support are bundled native pages reached from Settings in each language; reading them requires no network access. Selecting the contact email opens the system email service. Question content is bundled with the app and normal use requires no network connection. No account or credentials are required.

Update App Store Connect's existing notes to match this native build, add tested device/OS versions, and resolve or accurately disclose the branding permission status before submission. This file is a draft, not confirmation that store metadata has been saved.

## Required facts to verify before submission

- Publisher identity and documented rights to artwork, rules and questions; IHF logo permission is currently unclear
- Recheck that the public privacy and support URLs still resolve before submission
- Recheck logging before submission: on 24 October 2026, application and HTTP logging were disabled on both Azure App Services, neither app had Azure Monitor diagnostic settings, and Azure SQL auditing was disabled. These settings were not retaining request logs. Update all four privacy-policy translations if logging changes.
- Third-party SDK data collection and any crash reporting added after this review
- Store age ratings and target audience
- Final screenshots, app version, and release notes in each language offered on the store
