# Android and iOS release guide

The native apps package this Angular app with Capacitor 8. The web PWA is still deployed separately to Azure. Native app shell updates must go through the stores; the Angular service worker runs only in the web PWA. The native apps use the existing persisted Apollo cache for offline data after an initial successful sync.

## Project identity and build

- Display name: `IHF Rules Quiz`
- Android application ID and iOS bundle ID: `io.github.kristofgilis.ihfrulesquiz`
- Capacitor config: `capacitor.config.ts`
- Angular build output: `dist/ui-ihf-rules-questions/browser`
- The API must allow `https://localhost` (Android) and `capacitor://localhost` (iOS). Azure App Service's built-in CORS allowlist takes precedence over the API middleware, so both origins must be present there alongside the hosted web origin. Verify preflight responses from both native origins after deployment.

Run `npm ci` before building. The checked-in `android/` and `ios/` projects are the source of truth for platform settings.

```sh
npm run mobile:sync:android
npm run mobile:sync:ios
```

These scripts build Angular in production mode and copy its output into the native project. Use Android Studio to build and run `android/`. On a Mac with Xcode 26 or newer, build and run `ios/App/App.xcodeproj`. Android Studio and an Android SDK are required for Android; Xcode on macOS is required for iOS.

If no Mac is available locally, use the **Native Compile Checks** GitHub Actions workflow. It runs on relevant pull requests and can also be started manually. It compiles an unsigned iOS simulator app on a macOS runner and an Android debug app on an Ubuntu runner. Download the `ihf-rules-quiz-android-debug` artifact from a successful run to install the debug APK on an Android test device. The workflow requests 14 days of artifact retention, but repository policy can shorten it; check the artifact's displayed expiry. It does not replace physical-device testing, store signing, or submission.

The native icons and splash screens were generated from the square vector source in `assets/logo.svg`. If the artwork changes, regenerate Android and iOS resources with the current `@capacitor/assets` tool using icon background `#229cde`, splash background `#0f172a`, and logo splash scale `0.5`. Restrict generation to `--android` and `--ios` so the existing PWA manifest and icons stay intact. Review the resulting icons at small sizes. Confirm rights to the IHF name, logo, and question content before submitting either app.

After regenerating Android resources, run `npm run mobile:android:legacy-icons` so Android 7 launchers receive opaque blue icons as well as the adaptive icons used on newer Android versions.

## Device acceptance checks

Test on physical Android and iPhone devices before uploading a release build:

1. Fresh install online: all languages load; rules, questions, search, and quiz results work; the first data sync completes.
2. Restart in airplane mode: previously synced rules, questions, and quizzes remain usable; the UI communicates the offline state.
3. Fresh install in airplane mode: the bundled shell starts and clearly indicates that the first content download still needs a connection. Do not advertise content as available offline before this download.
4. Update the installed app: language, theme, and offline data remain usable; the next sync handles content or schema changes.
5. Verify the API preflight and GraphQL calls on both native origins, including the `Accept-Language` and `graphql-preflight` request headers.
6. Check safe areas, system back behavior, links that leave the app, portrait and landscape layout, accessibility labels, and the launch splash on each platform.

## Google Play

As of 25 October 2026, Google Play Console has not allowed app creation because account verification is incomplete. The identity documents were shown as under review, and contact-phone verification was marked as waiting for other verification tasks; the account owner reports having completed phone verification. Recheck the Console after Google's identity review. Google also requires the account owner to use the Play Console app on a non-rooted physical Android 10+ device for device verification; an emulator and the available phone older than ten years do not satisfy this gate. The Android debug build compiles in CI, but a Play release cannot be uploaded until the account permits app creation. See [Google's device-verification requirements](https://support.google.com/googleplay/android-developer/answer/14316361).

1. Create the Play Console app with the application ID above. Use an Android build that targets API 36 or later.
2. Generate and securely back up an upload key. Keep keystores and passwords outside Git. Enable Play App Signing and upload a signed Android App Bundle (`.aab`).
3. Complete the listing, screenshots, age rating, content declarations, support contact, privacy policy, and Data safety form based on actual app and API behavior.
4. Test on the internal track. If the developer account is a personal account created after 13 November 2023, run the required closed test with at least 12 continuously opted-in testers for 14 days before requesting production access.
5. Increase `versionCode` for every upload; set a matching user-facing `versionName`. Promote a verified build to production with a staged rollout.

## Apple App Store

As of 25 October 2026, the Apple Developer membership page shows renewal on 26 October 2027. The explicit bundle ID `io.github.kristofgilis.ihfrulesquiz` is registered with Team `XKF5T9N38M`, and the Xcode project uses that team for automatic signing. The App Store Connect record (Apple ID `6826826667`, SKU `ihf-rules-quiz-ios`) is in **Prepare for Submission**. Its English listing draft, review contact and notes, Sports category, licensed third-party content declaration, calculated 4+ age rating, published “Data Not Collected” privacy response, verified privacy and support URLs, Free price, and availability in all 175 current App Store countries and regions are set. TestFlight build 2 has passed processing, its export-compliance response is saved, and it is attached to iOS version 1.0. An internal TestFlight group contains build 2, and the account holder has been invited as its tester. The app has not been submitted for review.

The manual **Upload iOS build to TestFlight** workflow injects the selected marketing version and GraphQL schema version before the Angular bundle is built, then creates a signed App Store archive on GitHub's macOS runner and uploads it to App Store Connect. This keeps the app version shown on the home page aligned with the native version. Its required signing and API key values are configured as repository Actions secrets. Build 2 was uploaded and processed successfully, but predates the version injection and native tab bar changes. The workflow uploads builds but does not submit them for App Review. See Apple's [build upload guide](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/).

1. Build 2 remains available for comparison, but it predates the app-version injection and native tab bar changes in this branch. After this change is merged, upload the next build through **Upload iOS build to TestFlight**, then accept the internal TestFlight invitation, install that build, and capture the required screenshots. The product page still has no iPhone screenshots, and **Add for Review** is disabled.
2. Test the new build through TestFlight, including first sync, offline use, all four languages, the homepage app version, and native tab navigation. Add the device and OS versions tested to the App Review notes. No physical-device acceptance test is recorded yet.
3. Recheck privacy manifests, export compliance, all store metadata, and the selected build after screenshots and device testing are complete.
4. Submit version 1.0 for App Review only after the remaining requirements are met and you approve submission. The availability setting makes the app downloadable in the selected regions only after a release.

## Release gate

Before submission, verify the privacy and support URLs, content and branding rights, the wording of the offline promise, native icon quality, API availability, on-device tests, version numbers, and store signing. Store credentials and signing keys must remain outside the repository.
