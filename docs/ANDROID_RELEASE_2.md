# Android release 1.0 (2)

Prepared and submitted on 29 October 2026 in response to Google Play's recommendations for version 1.0 (1). The owner approved uploading version code 2, saving the four localized release notes and submitting the Alpha update for review and rollout. Google accepted the signed bundle and its attached ReTrace mapping. The publishing overview shows the single Alpha update under review, with automated checks running first. Managed publishing is off: after approval, build 2 will roll out to 100% of enrolled Alpha testers. Build 1 remains available until then; production is unchanged. Tester-group settings were not changed.

Google's release review estimates a 2.81 MB new-install download (10.2 MB smaller) and a 1.11 MB update download. Its compatibility table reports zero devices losing support. The missing-deobfuscation-file warning is gone; one optional warning remains for missing native debug symbols from bundled native libraries. The release is Google Play release record 3 in Alpha track 4700899783308185552; the application version code is 2.

## Changes

- Enable R8 code shrinking, optimisation and obfuscation, plus resource shrinking, for release builds. Use the Android optimiser's standard platform rules and dependency consumer rules; no package-wide keep rules were added.
- Preserve `mapping.txt` and the effective R8 configuration alongside the signed CI artifact. The signed-bundle workflow checks that the mapping file and bundled R8 metadata exist. Android verification also runs release lint.
- Retain `enableEdgeToEdge()`. Use safe drawing insets for scaffold content and top/horizontal safe drawing insets for the custom header, protecting controls from status bars, side system bars and display cutouts.

No app permissions, network behaviour, bundled question content, persistence format or store declarations changed.

## Build evidence

`lintRelease assembleRelease bundleRelease -PandroidVersionCode=2` passed with AGP 8.13.2, Kotlin 2.2.21, API 36 and JDK 17. Release lint reports zero errors and five existing warnings (dependency version, Compose parameter/offset conventions, launcher shape and monochrome icon).

| Measurement            | Version 1.0 (1) |    Optimised build |
| ---------------------- | --------------: | -----------------: |
| Local bundle bytes     |      13,229,626 | 4,931,474 unsigned |
| Uncompressed DEX bytes |      43,341,972 |          2,212,224 |
| DEX files              |               2 |                  1 |

The bundle includes `BUNDLE-METADATA/com.android.tools/r8.json` and `BUNDLE-METADATA/com.android.tools.build.obfuscation/proguard.map`. R8 metadata confirms shrinking, optimisation and obfuscation enabled. Its reported non-obfuscated/non-optimised/non-shrunk percentages are 1.95/2.71/1.81. Google Play will calculate its own displayed metrics after upload; no claim is made that its warning has already cleared.

The local signed upload candidate is ignored `tmp/android-preview/handball-rules-quiz-2.aab`, SHA-256 `BC368EED5034DD9F4D0C7562BA6F17DA93E538ACA6CA10BD35F5A8F21AFDDC0A`. Its signature verifies with the existing upload certificate. The standard self-signed certificate/timestamp notices are expected for this upload key. No private key or password is included in the artifact or repository.

## Runtime validation

The signed, minified release APK was installed on the isolated API 37 emulator `HandballRulesPreview`, port 5560. It completed a real ten-question offline quiz with expected 100% scoring and opened Rules. Settings switched through English, Dutch, French and Serbian. Light/dark settings and search with the software keyboard were checked. Full-resolution evidence is stored locally in ignored `tmp/android-preview/optimized-release/`.

Portrait and landscape layouts were visually checked with visible three-button navigation and gesture navigation. Landscape also used the tall display-cutout overlay; the header and content remained clear of the left cutout and right/bottom navigation controls. The emulator's reported navigation modes were verified as 0 (three-button) and 2 (gestural), after allowing System UI to apply the overlays. Initial emulator System UI failures were resolved with a cold restart after the build completed. This API 37 emulator does not substitute for Android 15/16 or physical-device acceptance. The existing Play edge-to-edge warning cannot be confirmed cleared until Google analyses the uploaded bundle.

References: [R8 configuration](https://developer.android.com/topic/performance/app-optimization/enable-app-optimization), [DEX optimisation metrics](https://developer.android.com/google/play/vitals/code-optimization), [Compose insets](https://developer.android.com/develop/ui/compose/system/insets-ui).

## Proposed release notes

- English: Smaller, optimised app build and improved layout around system bars and display cutouts.
- Dutch: Kleinere, geoptimaliseerde app en verbeterde weergave rond systeembalken en schermuitsparingen.
- French: Application plus légère et optimisée, avec une meilleure disposition autour des barres système et des encoches de l’écran.
- Serbian: Мања, оптимизована апликација и побољшан приказ око системских трака и изреза екрана.
