# App Store Deployment Guide

This guide covers the steps required to deploy the IHF Rules Questions PWA to various app stores.

## Table of Contents

1. [Generating Icons](#generating-icons)
2. [Apple App Store](#apple-app-store)
3. [Google Play Store (TWA)](#google-play-store-twa)
4. [Microsoft Store](#microsoft-store)
5. [Required Assets](#required-assets)

## Generating Icons

### Using PWA Asset Generator

Install the PWA Asset Generator:

```bash
npm install -g pwa-asset-generator
```

Generate all required icons from a source image (minimum 512x512px):

```bash
pwa-asset-generator logo.png ./public/icons --background "#ffffff" --padding "10%" --icon-only
```

### Manual Icon Sizes Required

The following icon sizes are required:

- **72x72** - Android launcher icon (ldpi)
- **96x96** - Android launcher icon (mdpi)
- **128x128** - Android launcher icon (hdpi)
- **144x144** - Android launcher icon (xhdpi), Microsoft tile
- **152x152** - iOS icon
- **192x192** - Android launcher icon (xxhdpi), PWA minimum
- **384x384** - Android launcher icon (xxxhdpi)
- **512x512** - PWA splash screen, maskable icon
- **180x180** - Apple touch icon

### Maskable Icons

For Android, create maskable icons that follow the safe zone guidelines:
- Keep important content within the central 80% circle
- Use tools like [Maskable.app](https://maskable.app/) to test

## Apple App Store

### Prerequisites

- Apple Developer Account ($99/year)
- macOS computer with Xcode installed
- Valid signing certificates

### Steps

1. **Prepare the PWA**
   - Ensure the PWA works offline
   - Test on Safari iOS
   - Verify manifest.webmanifest is properly configured

2. **Create an iOS Wrapper**

   Using PWABuilder:
   ```bash
   # Visit https://www.pwabuilder.com/
   # Enter your PWA URL
   # Click "Package for Stores" > "iOS"
   # Follow the wizard
   ```

   Or manually using Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/ios
   npx cap init "IHF Rules Questions" "com.ihf.rules"
   npx cap add ios
   npx cap copy
   npx cap open ios
   ```

3. **Configure App in Xcode**
   - Set bundle identifier: `com.ihf.rules` (or your preference)
   - Configure signing & capabilities
   - Add required device capabilities
   - Set deployment target (iOS 14.0+)

4. **Test on Device**
   - Use TestFlight for beta testing
   - Test on multiple iOS devices
   - Verify offline functionality

5. **Submit to App Store**
   - Create app in App Store Connect
   - Upload build via Xcode or Transporter
   - Fill in metadata:
     - App name: "IHF Rules Questions"
     - Subtitle: "Handball Rules Learning"
     - Keywords: handball, rules, IHF, sports, education
     - Description (see below)
   - Upload screenshots (required sizes below)
   - Submit for review

### Required Screenshots

- **6.5" Display (iPhone 14 Pro Max, 15 Pro Max)**
  - 1290 x 2796 pixels (portrait)
  - 2796 x 1290 pixels (landscape)

- **5.5" Display (iPhone 8 Plus)**
  - 1242 x 2208 pixels (portrait)
  - 2208 x 1242 pixels (landscape)

- **iPad Pro (12.9", 3rd gen)**
  - 2048 x 2732 pixels (portrait)
  - 2732 x 2048 pixels (landscape)

### App Description Template

```
Master handball rules with IHF Rules Questions - the comprehensive learning application for handball officials, coaches, and players.

FEATURES:
• Interactive rules questions with instant feedback
• Practice mode for focused learning
• Track your progress and scores
• Offline support - learn anywhere
• Multi-language support (English, Dutch, Serbian)
• Dark mode for comfortable viewing

Perfect for:
- Handball referees preparing for certification
- Coaches teaching the game
- Players understanding the rules
- Sports officials staying current

Based on official IHF (International Handball Federation) rules.
```

## Google Play Store (TWA)

### Prerequisites

- Google Play Developer Account ($25 one-time fee)
- Android Studio installed
- JDK 11 or later

### Using Trusted Web Activity (TWA)

1. **Generate TWA using Bubblewrap**

   Install Bubblewrap:
   ```bash
   npm install -g @bubblewrap/cli
   ```

   Initialize the project:
   ```bash
   bubblewrap init --manifest=https://yourdomain.com/manifest.webmanifest
   ```

   Build the Android package:
   ```bash
   bubblewrap build
   ```

2. **Configure the TWA**

   Edit `twa-manifest.json`:
   ```json
   {
     "packageId": "com.ihf.rules",
     "host": "yourdomain.com",
     "name": "IHF Rules Questions",
     "launcherName": "IHF Rules",
     "display": "standalone",
     "themeColor": "#3f51b5",
     "backgroundColor": "#ffffff",
     "startUrl": "/",
     "iconUrl": "https://yourdomain.com/icons/icon-512x512.png",
     "maskableIconUrl": "https://yourdomain.com/icons/icon-512x512.png",
     "splashScreenFadeOutDuration": 300,
     "enableNotifications": false
   }
   ```

3. **Set up Digital Asset Links**

   Create `.well-known/assetlinks.json` on your domain:
   ```json
   [{
     "relation": ["delegate_permission/common.handle_all_urls"],
     "target": {
       "namespace": "android_app",
       "package_name": "com.ihf.rules",
       "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
     }
   }]
   ```

   Get your SHA-256 fingerprint:
   ```bash
   keytool -list -v -keystore your-keystore.keystore
   ```

4. **Test the TWA**
   ```bash
   bubblewrap install
   ```

5. **Build Release APK/AAB**
   ```bash
   bubblewrap build --skipPwaValidation
   ```

6. **Upload to Google Play Console**
   - Create new app in Google Play Console
   - Upload the AAB file (app-release-bundle.aab)
   - Fill in store listing:
     - App name: "IHF Rules Questions"
     - Short description: "Interactive handball rules learning application"
     - Full description (see template below)
   - Upload screenshots and feature graphic
   - Set content rating
   - Submit for review

### Required Graphics

- **App Icon**: 512 x 512 px (PNG, no alpha)
- **Feature Graphic**: 1024 x 500 px (PNG or JPG)
- **Screenshots**: At least 2 screenshots
  - Phone: 16:9 or 9:16 aspect ratio
  - 7" Tablet: 16:9 or 9:16 aspect ratio
  - 10" Tablet: 16:9 or 9:16 aspect ratio

### Play Store Description Template

```
Master handball rules with IHF Rules Questions! 🤾

Learn and practice handball rules through interactive questions and instant feedback. Perfect for referees, coaches, and players at all levels.

✨ KEY FEATURES
• Interactive rules questions with detailed explanations
• Practice mode for focused study sessions
• Track your progress and scores
• Works offline - learn anywhere, anytime
• Multiple languages: English, Dutch, Serbian
• Dark mode for comfortable studying

🎯 WHO IS IT FOR?
• Handball referees preparing for certification exams
• Coaches teaching rules to their teams
• Players wanting to understand the game better
• Sports officials staying up-to-date

📚 BASED ON OFFICIAL IHF RULES
All questions are based on the official International Handball Federation (IHF) rules and regulations.

🌙 MODERN & INTUITIVE
Clean, modern interface with dark mode support. Responsive design works great on phones and tablets.

Download now and become a handball rules expert!
```

## Microsoft Store

### Prerequisites

- Microsoft Partner Center account (free)
- Windows 10/11 for testing

### Steps

1. **Use PWABuilder for Microsoft Store**

   Visit [PWABuilder](https://www.pwabuilder.com/):
   - Enter your PWA URL
   - Click "Build My PWA"
   - Select "Windows" package
   - Download the package

2. **Manual Packaging Alternative**

   Using PWA Studio or manually:
   ```bash
   npm install -g pwabuilder-windows10-platform
   ```

3. **Configure App Manifest**

   Ensure your manifest includes:
   ```json
   {
     "name": "IHF Rules Questions",
     "short_name": "IHF Rules",
     "description": "Interactive handball rules questions and learning application",
     "display": "standalone",
     "theme_color": "#3f51b5",
     "background_color": "#ffffff"
   }
   ```

4. **Test on Windows**
   - Install the .msix package locally
   - Test all functionality
   - Verify offline mode works

5. **Submit to Microsoft Store**
   - Sign in to Partner Center
   - Create new app submission
   - Upload .msix or .msixbundle package
   - Fill in store listing:
     - App name: "IHF Rules Questions"
     - Description (see template above)
     - Category: Education
     - Age rating: 3+
   - Upload screenshots
   - Submit for certification

### Required Assets for Microsoft Store

- **App Icon**: Multiple sizes (44x44, 50x50, 150x150, 310x310 px)
- **Screenshots**: At least 1 screenshot (768x1366 or larger)
- **Store Logo**: 300x300 px
- **Wide Tile**: 310x150 px (optional)
- **Large Tile**: 310x310 px (optional)

## Required Assets Summary

### Icons
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512 px
- Apple touch icon: 180x180 px
- Maskable icons for Android: 192x192, 512x512 px

### Screenshots
Create screenshots demonstrating:
1. Home screen with question categories
2. Question interface with multiple choice
3. Results/score display
4. Settings/language selection
5. Dark mode (if applicable)

### Sizes by Platform
- **iOS**: 6.5" display (1290x2796), 5.5" display (1242x2208), iPad (2048x2732)
- **Android**: Phone portrait/landscape, 7" tablet, 10" tablet
- **Windows**: Minimum 768x1366

### Additional Materials
- App description (under 4000 characters)
- Short description (80 characters for Google Play)
- Privacy policy URL
- Support email
- Website URL
- Keywords/tags

## Testing Checklist

Before submitting to any store:

- [ ] PWA installs correctly
- [ ] Offline functionality works
- [ ] All features work as expected
- [ ] No console errors in production build
- [ ] App works on target platform (iOS/Android/Windows)
- [ ] All links and navigation work
- [ ] Performance is acceptable (load time < 3s)
- [ ] Accessibility features work (screen readers, keyboard navigation)
- [ ] Multi-language support works correctly
- [ ] Dark mode works correctly
- [ ] App handles network failures gracefully
- [ ] All assets are properly sized and formatted
- [ ] Privacy policy is available
- [ ] Terms of service are available (if required)

## Troubleshooting

### PWA Not Installing on iOS
- Verify manifest.webmanifest is accessible
- Check that start_url is correct
- Ensure icons are the right sizes
- Test in Safari iOS (not Chrome iOS)

### TWA Not Launching on Android
- Verify Digital Asset Links are set up correctly
- Check that the SHA-256 fingerprint matches
- Ensure HTTPS is properly configured
- Test the assetlinks.json file is accessible

### Microsoft Store Rejection
- Ensure app meets minimum functionality requirements
- Verify all content is appropriate
- Check that offline mode works
- Ensure proper error handling

## Resources

- [PWABuilder](https://www.pwabuilder.com/)
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
- [Microsoft Store Policies](https://docs.microsoft.com/en-us/windows/uwp/publish/store-policies)
- [Web.dev PWA Checklist](https://web.dev/pwa-checklist/)
- [Maskable Icon Editor](https://maskable.app/)

## Support

For issues specific to this application, please contact the development team or create an issue in the repository.
