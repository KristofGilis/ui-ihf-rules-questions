# Android closed-test preparation

Status on 29 October 2026: the four localized listings and all 48 screenshots are saved. Internal testing is active. The Alpha closed-test release 1.0 (1) is prepared with the existing signed bundle and release notes in four languages. The approved worldwide selection (177 countries/regions plus Rest of the world) and tester Google Group are saved. Google Play's publishing overview has 18 changes ready for submission, including the release, listings and declarations. The owner approved submission and automatic closed-test rollout after Google approval. All 18 changes were submitted on 29 October 2026; Play Console now shows changes under review with automated checks running first. No production release has been requested. Managed publishing is off, so approval would automatically make the closed release available to eligible testers. Two non-blocking diagnostics warnings concern absent deobfuscation and native debug-symbol files.

The app's Play Console dashboard requires at least 12 testers enrolled continuously in the closed test for 14 days before the owner can apply for production access. Internal-test enrollment does not satisfy that separate requirement. Keep a small reserve of willing testers so withdrawals do not leave the group below 12.

## Owner inputs

Recruit people who can use a supported Android device and a Google account. Collect their Google-account email addresses privately, or arrange a Google Group for the closed test. Do not commit tester names or email lists to this repository.

Once the listing and release are ready, approve the actual closed-test draft, its tester group and its countries before rollout. Share the closed-test opt-in link after that release becomes available. Each tester must enroll using the approved Google account; merely receiving an invitation or joining the internal test is insufficient.

## Suggested invitation text

> I'm preparing Handball Rules Quiz for Android and need volunteers for a closed test. Could you install it through Google Play, keep your account enrolled for at least 14 consecutive days, use it during that period, and tell me about any problems or unclear wording? It is a free, offline handball rules quiz. I'll send the opt-in link once the test is ready. Please send me the email address of the Google account you use for Google Play privately.

This is a draft for the owner to send; no invitations have been sent by the agent.

## Twelve Testers recruitment draft

The owner selected Twelve Testers on 29 October 2026 and completed registration and email verification. A draft listing is saved at https://twelvetesters.com/dashboard/apps/cmvtk1cmd1o5yln2bw8x5awbc/edit with the approved app icon, four English phone screenshots, category Education, all four app languages, target 20 testers, a 15-day session, instructions and feedback requests. The Google Group and both Play links are saved. The listing remains DRAFT and no tester requests have been sent. The owner approved publishing it once closed-test enrollment works; Google approval and enrollment verification are still pending. The site supports voluntary testing partnerships; partners may request reciprocal testing. Do not promise this while the owner has no usable Android phone.

The owner approved creating https://groups.google.com/g/handball-rules-quiz-android-testers and completed Google's CAPTCHA. The group is publicly discoverable and allows voluntary joining; only the owner can post or view the member list, and conversations are restricted to members. No invitations were sent. Google Play Alpha uses `handball-rules-quiz-android-testers@googlegroups.com` for enrollment and the approved public support email for feedback. Joining the group alone does not start the required Play opt-in period.

Proposed title: **Handball Rules Quiz — Android closed-test volunteers**.

Proposed listing text:

> Help test a free handball rules study app for Android. It includes quizzes with adjustable question counts and an optional timer, questions organised by rule, search, and answer review. All question content is bundled and works offline from the first launch. No account, ads or purchases are required.
>
> Languages: English, Dutch, French and Serbian. Light, dark and system appearance are supported, with phone and tablet layouts. Requires Android 7.0 or later.
>
> I'm looking for 15–20 volunteers who can remain enrolled in the Google Play closed test for at least 14 consecutive days, use the app during that period and provide private feedback. Please try a quiz, review your answers, browse rules, search, and switch the theme or language. Report your device, Android version and steps for any issue. Handball knowledge is helpful but not required for interface feedback.
>
> I currently cannot commit to reciprocal Android testing, so please volunteer only if that works for you. No public ratings or reviews are requested.

Use the approved app icon and English phone screenshots in Home → quiz → score → rules order. Add the actual **closed-test** enrollment link and tester-group instructions once configured; the existing internal-test link must not be substituted. Do not describe the test as live until the release is available. Requests to individual developers and any reciprocal commitments need the owner's authorization.

References: [Twelve Testers workflow](https://twelvetesters.com/how-it-works), [registration](https://twelvetesters.com/signup).

## Useful feedback checklist

- First launch and use in airplane mode, including rules, questions and search.
- Home question-count choices and timed/untimed quizzes.
- Selecting multiple answers, previous/next navigation, closing and resuming a quiz.
- Completed scores, the percentage on one line, and answer review preserving the quiz order.
- Interface and question text in the languages the tester knows.
- Light, dark and system appearance; readability with larger system text.
- Phone layout and tablet layout where available.

Record the tested app version, device/Android version, steps, expected behaviour and actual result for any issue. Keep feedback and fixes so the production-access application can accurately describe the test and what changed. Completing the minimum enrollment period permits an application; it is not automatic production approval.

Reference: [Google Play testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465).
