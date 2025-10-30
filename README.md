# IHF Rules Quiz

A modern, mobile-first quiz application for testing knowledge of IHF (International Handball Federation) rules. Built with Angular 20, Tailwind CSS v4, and Capacitor for native mobile deployment.

## Features

- 🎯 **Quiz Mode**: Take timed quizzes with randomized questions
- 📱 **Mobile-First**: Responsive design optimized for mobile devices
- 🌓 **Dark/Light Theme**: System preference detection with manual toggle
- 🌍 **Multi-language**: Support for English, Dutch, and Serbian
- ⚡ **Native Apps**: Deploy to iOS and Android app stores with Capacitor
- 🎨 **Modern UI**: Clean, accessible interface built with Tailwind CSS v4

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- For iOS development: Xcode (macOS only)
- For Android development: Android Studio

## Installation

```bash
# Clone the repository
git clone https://github.com/KristofGilis/ui-ihf-rules-questions.git
cd ui-ihf-rules-questions

# Install dependencies
npm ci
```

## Development

### Web Development Server

```bash
# Start the development server
npm start

# The app will be available at http://localhost:4200/
# The application will automatically reload if you change any source files
```

### Build for Production

```bash
# Build for web
npm run build:web

# Build artifacts will be stored in the dist/ directory
```

## Mobile Development with Capacitor

### Initial Capacitor Setup

```bash
# Initialize Capacitor (only needed once)
npm run cap:init

# Add iOS platform
npm run cap:add:ios

# Add Android platform
npm run cap:add:android
```

### Building for Mobile

#### Android

```bash
# Build and open in Android Studio
npm run build:android

# This will:
# 1. Build the web app for production
# 2. Copy web assets to Android project
# 3. Sync Capacitor plugins
# 4. Open Android Studio
```

In Android Studio:
1. Wait for Gradle sync to complete
2. Connect an Android device or start an emulator
3. Click "Run" to install and launch the app

#### iOS

```bash
# Build and open in Xcode (macOS only)
npm run build:ios

# This will:
# 1. Build the web app for production
# 2. Copy web assets to iOS project
# 3. Sync Capacitor plugins
# 4. Open Xcode
```

In Xcode:
1. Select a target device or simulator
2. Click "Run" to build and launch the app

### Sync Capacitor After Code Changes

```bash
# Sync all platforms
npm run cap:sync

# Or sync specific platforms
npm run cap:sync:android
npm run cap:sync:ios
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run build:web` - Build for production (web)
- `npm run build:android` - Build and open in Android Studio
- `npm run build:ios` - Build and open in Xcode
- `npm run cap:init` - Initialize Capacitor
- `npm run cap:add:android` - Add Android platform
- `npm run cap:add:ios` - Add iOS platform
- `npm run cap:sync` - Sync all platforms
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run prettier:check` - Check code formatting
- `npm run prettier:write` - Format code
- `npm run i18n:extract` - Extract translation keys
- `npm run i18n:clean` - Clean unused translation keys

## Project Structure

```
src/
├── app/
│   ├── home/              # Home page with quiz configuration
│   ├── questions/         # Questions and quiz components
│   ├── rules/             # Rules browsing components
│   ├── services/          # Core services (theme, quiz state)
│   ├── shared/            # Shared components (header, navigation)
│   └── ...
├── styles.scss           # Global styles and Tailwind configuration
└── ...

public/
├── i18n/                 # Translation files (en, nl, srb)
└── icons/                # App icons and assets

capacitor.config.ts       # Capacitor configuration
assets.json              # Asset generation configuration
```

## Internationalization (i18n)

The app supports three languages:
- English (en)
- Dutch (nl)
- Serbian (srb)

Translation files are located in `public/i18n/`. To add or update translations:

1. Edit the JSON files in `public/i18n/`
2. Run `npm run i18n:extract` to extract new keys
3. Add translations for all supported languages

## Theme Customization

The app uses CSS variables for theming. Edit `src/styles.scss` to customize:

- Colors (primary, secondary, accent, etc.)
- Spacing
- Typography
- Light/Dark mode palettes

## Building for App Stores

### Android (Google Play)

1. Generate a release build in Android Studio
2. Sign the APK/AAB with your keystore
3. Upload to Google Play Console

### iOS (App Store)

1. Configure code signing in Xcode
2. Archive the app (Product > Archive)
3. Upload to App Store Connect

## Troubleshooting

### Build Issues

**Issue**: Tailwind deprecation warning
```
Sass @import rules are deprecated
```
**Solution**: This is a known issue with Tailwind CSS v4. It doesn't affect functionality and will be resolved in future versions.

**Issue**: Capacitor sync fails
```
[error] Capacitor could not find the web assets directory
```
**Solution**: Make sure you've run `npm run build:web` before syncing.

### Development Issues

**Issue**: App doesn't reload on changes
**Solution**: Check that the Angular development server is running and watching for file changes.

**Issue**: Theme not applying
**Solution**: Clear browser cache and check that `ThemeService` is initialized in `app.component.ts`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- IHF (International Handball Federation) for the handball rules
- Angular team for the framework
- Tailwind CSS team for the styling framework
- Capacitor team for the native app framework

## Support

For issues, questions, or contributions, please visit:
https://github.com/KristofGilis/ihf_rules_questions
