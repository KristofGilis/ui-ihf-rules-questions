# IHF Rules Quiz

A modern, mobile-first quiz application for testing knowledge of IHF (International Handball Federation) rules. Built with Angular 20 and Tailwind CSS v4.

## Features

- 📱 **Mobile-First Design**: Responsive layout with bottom navigation for mobile devices
- 🎨 **Modern UI**: Built with Tailwind CSS v4 (CSS-based configuration)
- 🌓 **Theme Support**: Light/dark mode with system preference detection and user toggle
- 🌍 **Internationalization**: Support for English, Dutch, and Serbian languages
- 📝 **Quiz Mode**: Multiple-choice questions with optional timer (90 seconds per question)
- 📊 **Score Tracking**: Detailed results with percentage, correct/wrong counts, and answer review
- 📱 **Native Apps**: Capacitor integration for iOS and Android builds

## Technology Stack

- **Framework**: Angular 20
- **UI Framework**: Tailwind CSS v4
- **Icons**: FontAwesome
- **State Management**: Angular Signals
- **GraphQL**: Apollo Angular
- **i18n**: @ngx-translate
- **Native**: Capacitor 6

## Development Setup

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/KristofGilis/ui-ihf-rules-questions.git
cd ui-ihf-rules-questions

# Install dependencies
npm install
```

### Development Server

```bash
# Start the development server
npm start

# The application will be available at http://localhost:4200/
```

### Build for Web

```bash
# Production build
npm run build:web

# The build artifacts will be stored in dist/ui-ihf-rules-questions/browser/
```

## Capacitor Native Builds

### Initialize Capacitor (First Time Only)

Capacitor has already been initialized with:
- **App ID**: `net.rulequestions.ihf`
- **App Name**: `IHF Rules Quiz`

### Add Platforms

```bash
# Add Android platform
npm run cap:add:android

# Add iOS platform (macOS only)
npm run cap:add:ios
```

### Build and Run Native Apps

#### Android

```bash
# Build web assets and open Android Studio
npm run build:android

# Or manually:
npm run build:web
npx cap sync android
npx cap open android
```

Then build and run from Android Studio.

#### iOS

```bash
# Build web assets and open Xcode (macOS only)
npm run build:ios

# Or manually:
npm run build:web
npx cap sync ios
npx cap open ios
```

Then build and run from Xcode.

### Icons and Splash Screens

App icons and splash screens can be generated from `public/icons/safari-pinned-tab.svg`:

```bash
# Using @capacitor/assets (recommended)
npm install -D @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor '#4f46e5' --splashBackgroundColor '#4f46e5'
```

For production, regenerate icons using appropriate tools from the SVG source.

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run build:web` - Build for production (explicit)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run prettier:check` - Check code formatting
- `npm run prettier:write` - Format code
- `npm run generate` - Generate GraphQL types
- `npm run i18n:extract` - Extract translation strings
- `npm run i18n:clean` - Clean unused translation keys
- `npm run cap:init` - Initialize Capacitor
- `npm run cap:add:android` - Add Android platform
- `npm run cap:add:ios` - Add iOS platform
- `npm run cap:sync` - Sync web assets to native platforms
- `npm run build:android` - Build and open Android project
- `npm run build:ios` - Build and open iOS project

## Project Structure

```
ui-ihf-rules-questions/
├── src/
│   ├── app/
│   │   ├── home/           # Home page with quiz options
│   │   ├── questions/      # Quiz questions components
│   │   ├── rules/          # Rules listing
│   │   └── logo/           # App logo component
│   ├── styles.scss         # Global styles with Tailwind
│   └── index.html          # Main HTML file
├── public/
│   ├── icons/              # App icons
│   └── i18n/               # Translation files
│       ├── en.json         # English
│       ├── nl.json         # Dutch
│       └── srb.json        # Serbian
├── resources/              # Native app resources
├── capacitor.config.ts     # Capacitor configuration
├── angular.json            # Angular CLI configuration
└── package.json            # Dependencies and scripts
```

## Internationalization

The app supports multiple languages using @ngx-translate:

- English (en)
- Dutch (nl)
- Serbian (srb)

Translation files are located in `public/i18n/`. To add a new language:

1. Create a new JSON file in `public/i18n/` (e.g., `fr.json`)
2. Add the language code to `app.component.ts`
3. Update language options in the UI

Extract new translation keys:
```bash
npm run i18n:extract
```

## Theme Customization

The app uses Tailwind CSS v4 with CSS-based configuration. Theme colors can be customized in `src/styles.scss`:

```css
@theme {
  --color-primary-500: oklch(0.57 0.15 240);
  /* Adjust other color values as needed */
}
```

## GraphQL API

The app connects to a GraphQL API for fetching questions and rules. The API endpoint is configured in `src/app/graphql.provider.ts`.

To regenerate GraphQL types:
```bash
npm run generate
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

Special thanks to all collaborators who help with translations and improvements.

## License

Copyright © 2025, Kristof Gilis

## Further Help

For Angular CLI help:
```bash
ng help
```

Or visit the [Angular CLI documentation](https://angular.dev/tools/cli).

For Capacitor help, visit [Capacitor Documentation](https://capacitorjs.com/docs).
