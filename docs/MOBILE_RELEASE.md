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

If no Mac is available locally, use the **Native Compile Checks** GitHub Actions workflow. It runs on relevant pull requests and can also be started manually. It compiles an unsigned iOS simulator app on a macOS runner and an Android debug app on an Ubuntu runner. Download the `ihf-rules-quiz-android-debug` artifact from a successful run to install the debug APK on an Android test device. The artifact expires after 14 days. It does not replace physical-device testing, store signing, or submission.

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

1. Create the Play Console app with the application ID above. Use an Android build that targets API 36 or later.
2. Generate and securely back up an upload key. Keep keystores and passwords outside Git. Enable Play App Signing and upload a signed Android App Bundle (`.aab`).
3. Complete the listing, screenshots, age rating, content declarations, support contact, privacy policy, and Data safety form based on actual app and API behavior.
4. Test on the internal track. If the developer account is a personal account created after 13 November 2023, run the required closed test with at least 12 continuously opted-in testers for 14 days before requesting production access.
5. Increase `versionCode` for every upload; set a matching user-facing `versionName`. Promote a verified build to production with a staged rollout.

## Apple App Store

1. Enrol in the Apple Developer Program, create the bundle ID and App Store Connect record, and configure the Xcode signing team.
2. On macOS, archive with a supported Xcode/iOS SDK and upload to App Store Connect. Increase the build number for every upload and set the release version.
3. Complete screenshots, age rating, support URL, an accessible in-app and listing privacy policy, and App Privacy answers. Check any native SDK privacy manifests.
4. Test through TestFlight. In the review notes, explain the quiz, offline sync, and any external service dependencies. Submit the verified build for App Review.

## Release gate

Before submission, verify the privacy and support URLs, content and branding rights, the wording of the offline promise, native icon quality, API availability, on-device tests, version numbers, and store signing. Store credentials and signing keys must remain outside the repository.
