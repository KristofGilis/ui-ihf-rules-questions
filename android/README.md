# Handball Rules Quiz for Android

Native Kotlin and Jetpack Compose app. The Angular PWA remains under `../src` and is not embedded in this app.

## Offline content

`app/src/main/assets/content.sqlite` is generated from the same validated SQLite content database as the iOS app. It contains the English, Dutch, French and Serbian editions, ordered questions/rules, search index and scoring configuration. The app copies the asset into private storage on first launch and replaces it when the bundled content hash changes. Core app flows do not use the network; the manifest declares no Internet permission.

After changing the shared content, interface strings, or native Privacy/Support text in `ios/App/App/OfflineContent/AppInformation.json`, regenerate the Android assets and review the resulting asset changes:

```sh
python3 scripts/prepare-android-content.py
```

## Build

Requirements: JDK 17, Android SDK platform 36 and Build Tools 36.0.0. The checked-in Gradle wrapper pins Gradle 8.13 and verifies its distribution checksum. Set `JAVA_HOME` and `ANDROID_HOME`, or configure the SDK path through Android Studio's local settings.

From the repository root on Windows:

```powershell
.\android\gradlew.bat -p android lintDebug assembleDebug assembleRelease bundleRelease
```

On Linux or macOS:

```sh
bash android/gradlew -p android lintDebug assembleDebug assembleRelease bundleRelease
```

The independent Android workflow installs the supported toolchain on Linux and runs the same checks. Debug APK output is `app/build/outputs/apk/debug/app-debug.apk`. Ordinary verification builds produce unsigned release outputs. The manual **Android signed bundle** workflow uses the configured repository signing secrets; see [release setup](../docs/MOBILE_RELEASE.md#android-signing-and-play-draft). Minimum supported Android version is 7.0 (API 24), as required by the enabled automatic Play protection.

## Identity and release

Application ID `io.github.kristofgilis.ihfrulesquiz` is confirmed in the Google Play draft for Handball Rules Quiz (app ID `4976385006116525227`). Set a version code greater than every previously uploaded Android build. The first upload key is configured through GitHub secrets; Google manages the separate app-signing key. Do not place a keystore or Play service-account key in source control. Build/sign/upload does not publish the app; rollout needs separate owner approval.
