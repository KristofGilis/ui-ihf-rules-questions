# App Resources

This directory contains resources for building native mobile apps.

## App Icons

To generate app icons for Android and iOS:

1. Create a 1024x1024px PNG icon and save it as `icon.png` in this directory
2. Create a 2732x2732px PNG splash screen and save it as `splash.png` in this directory
3. Use the `@capacitor/assets` tool to generate all required sizes:
   ```bash
   npm install -g @capacitor/assets
   npx capacitor-assets generate --iconBackgroundColor '#0066cc' --splashBackgroundColor '#ffffff'
   ```

## Placeholder Icons

Currently, the app uses placeholder icons. Replace these with your actual app icons before publishing to app stores.

## Android

Android icons are stored in `android/app/src/main/res/` in various `mipmap-*` directories.

## iOS

iOS icons are stored in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`.

## Requirements

- App icon: 1024x1024px PNG (no transparency)
- Splash screen: 2732x2732px PNG
- Follow platform-specific guidelines:
  - [Android Icon Guidelines](https://developer.android.com/google-play/resources/icon-design-specifications)
  - [iOS Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
