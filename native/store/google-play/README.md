# Google Play artwork and screenshots

The approved icon and feature graphic are saved in the Play Console listing draft. Regenerate the images with:

```sh
node scripts/generate-android-store-assets.mjs
```

- `app-icon.png`: 512 × 512, opaque, existing native icon without a pre-applied corner mask.
- `feature-graphic.png`: 1024 × 500, opaque, existing native artwork and app palette. The app name is the same in every listing language.
- `feature-graphic.svg`: reproducible composition source; embeds the existing raster mark.

## Screenshot capture checklist

The 48 source captures are in `screenshots/`: four screens for each of English, Dutch, French and Serbian, on phone, 7-inch tablet and 10-inch tablet. `screenshots/manifest.json` records the APK hash, source revision, display settings, image dimensions and checksums. Captures use version 1.0 (1), built from the current native sources with minimum SDK 24. All twelve sets were verified saved in Play Console in Home → quiz → score → rules order on 29 October 2026, after the owner completed the remaining uploads.

Capture the actual native Android app in English, Dutch, French and Serbian. Use the same sequence in each locale: Home, active quiz, completed score/review, Rules. Include phone and tablet layouts. Keep screenshots unmodified and keep source captures with the app version, locale, device dimensions and capture date recorded.

Use a 1080 × 1920 phone display. Existing development previews in ignored `tmp/android-preview/` are 1080 × 2400; do not stretch them to fit the store format. The isolated `HandballRulesPreview` emulator uses port 5560 and was configured for the store dimensions during capture. Its previous configuration is backed up in ignored `tmp/android-preview/config-before-store.ini`.

The completed captures used 420 dpi for phone, 1200 × 1920 at 320 dpi for 7-inch tablet and 1600 × 2560 at 280 dpi for 10-inch tablet. The owner explicitly approved using ADB on emulator 5560 for navigation and full-resolution capture. Animations were disabled on that emulator during capture. No physical devices or Google accounts were accessed for capture.

Each score comes from a real ten-question attempt, with correct answers selected through the app controls. Result point totals vary because questions can have multiple correct answers. French Home and Dutch phone score were recaptured after rendering settled; the existing translations were correct and no application code change was needed.

Before capture, confirm the correct native build is installed, complete any retained session through the app's normal controls, select the intended locale and theme, and ensure no emulator dialogs or debugging overlays obscure content. Capture a real completed attempt rather than drawing or editing a score into an image. Keep the installed app's branding and navigation visible.

Inspect every exported image for dimensions, clipped text, untranslated interface strings, wrong locale, and accidental system overlays. Upload only after owner approval. The screenshots, listing draft and policy declarations do not authorize a closed-test rollout, review submission or public release.
