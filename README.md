# IHF Rules Questions

A modern, mobile-first Angular application for learning and testing knowledge of IHF handball rules.

## Features

- ✨ Modern UI with Tailwind CSS v4
- 🌓 Light/Dark theme support (auto-detects system preference)
- 📱 Mobile-first responsive design
- 🧭 Native mobile app support (iOS & Android via Capacitor)
- 🌍 Multi-language support (English, Dutch, Serbian)
- ❓ Quiz mode with randomized questions
- ⏱️ Optional timed quiz mode
- 📊 Detailed score tracking and feedback
- ♿ Accessible design with keyboard navigation

## Prerequisites

- Node.js 18+ and npm
- Angular CLI 20+
- For iOS development: macOS with Xcode
- For Android development: Android Studio

## Installation

```bash
npm install
```

## Development

### Web Development Server

Run the development server:

```bash
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you make changes.

### Build for Web

Build the web application for production:

```bash
npm run build:web
```

The build artifacts will be stored in the `dist/ui-ihf-rules-questions/` directory.

## Mobile App Development

### Initial Capacitor Setup

Capacitor is already initialized. To regenerate the native projects:

```bash
npm run capacitor:init
```

### Add Mobile Platforms

Add Android platform:
```bash
npm run capacitor:add:android
```

Add iOS platform:
```bash
npm run capacitor:add:ios
```

### Sync Web Assets to Native Apps

After building the web app, sync changes to native platforms:

```bash
npm run capacitor:sync
```

### Build and Run Native Apps

#### Android

1. Build the web app first:
   ```bash
   npm run build:web
   ```

2. Open in Android Studio:
   ```bash
   npm run build:android
   ```

3. Run on emulator or connected device from Android Studio

#### iOS

1. Build the web app first:
   ```bash
   npm run build:web
   ```

2. Open in Xcode:
   ```bash
   npm run build:ios
   ```

3. Run on simulator or connected device from Xcode

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── components/      # Shared UI components
│   │   │   ├── header/
│   │   │   ├── bottom-nav/
│   │   │   └── sidebar/
│   │   ├── services/        # Core services
│   │   │   ├── theme.service.ts
│   │   │   └── quiz.service.ts
│   │   ├── home/           # Home page
│   │   ├── rules/          # Rules pages
│   │   ├── questions/      # Questions pages
│   │   └── ...
│   ├── styles.scss         # Global styles with Tailwind
│   └── ...
├── public/
│   └── i18n/              # Translation files
│       ├── en.json
│       ├── nl.json
│       └── srb.json
├── resources/             # Mobile app resources
│   └── README.md         # App icon instructions
├── android/              # Android native project (generated)
├── ios/                  # iOS native project (generated)
└── capacitor.config.ts   # Capacitor configuration
```

## Theme Customization

The app uses CSS variables for theming. Customize colors in `src/styles.scss`:

```scss
@theme {
  --color-primary: oklch(0.55 0.18 231);
  --color-bg-light: oklch(0.98 0.01 231);
  --color-bg-dark: oklch(0.15 0.01 231);
  /* ... */
}
```

## Internationalization

Add or update translations in `public/i18n/`:

- `en.json` - English
- `nl.json` - Dutch
- `srb.json` - Serbian

After making changes, extract new translation keys:

```bash
npm run i18n:extract
```

## Code Quality

### Linting

Check code style:
```bash
npm run lint
```

Fix linting issues automatically:
```bash
npm run lint:fix
```

### Formatting

Check code formatting:
```bash
npm run prettier:check
```

Fix formatting issues:
```bash
npm run prettier:write
```

## App Store Deployment

### Android (Google Play)

1. Update app version in `package.json` and `android/app/build.gradle`
2. Generate signed APK/AAB in Android Studio
3. Follow [Google Play deployment guide](https://developer.android.com/studio/publish)

### iOS (App Store)

1. Update app version in `package.json` and Xcode project
2. Create app listing in App Store Connect
3. Archive and upload build from Xcode
4. Follow [App Store deployment guide](https://developer.apple.com/app-store/submissions/)

## Contributing

Contributions are welcome! Please follow the existing code style and add tests for new features.

## License

Copyright 2025, Kristof Gilis

## Technology Stack

- **Framework**: Angular 20
- **Styling**: Tailwind CSS v4
- **Icons**: FontAwesome
- **Mobile**: Capacitor 6
- **i18n**: ngx-translate
- **GraphQL**: Apollo Angular
- **Build**: Angular CLI with esbuild
