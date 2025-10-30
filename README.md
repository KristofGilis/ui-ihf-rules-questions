# IHF Rules Quiz

An Angular-based quiz application for testing knowledge of IHF (International Handball Federation) Rules of the Game. Available as a web application and native mobile app (Android/iOS) via Capacitor.

## Features

- Multiple-choice quiz with timed questions
- Randomized questions and answers
- Progress tracking and score summaries
- Multi-language support (English, Dutch, Serbian)
- Light/Dark theme with system preference detection
- Responsive mobile-first design with Tailwind CSS

## Development

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.3.

### Development Server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Code Scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Building

### Web Build

To build the project for web:

```bash
npm run build:web
```

The build artifacts will be stored in the `dist/ui-ihf-rules-questions/browser/` directory.

### Android Build

Prerequisites:
- Android Studio installed
- Android SDK configured
- JDK 17 or higher

To build for Android:

```bash
npm run build:android
```

This will:
1. Build the web application
2. Sync the build to the Android project
3. Open Android Studio where you can run or build the APK/AAB

Alternatively, build manually:
```bash
npm run build:web
npm run cap:sync
npx cap open android
```

### iOS Build

Prerequisites:
- macOS with Xcode installed
- CocoaPods installed (`sudo gem install cocoapods`)
- iOS development certificates configured

To build for iOS:

```bash
npm run build:ios
```

This will:
1. Build the web application
2. Sync the build to the iOS project
3. Open Xcode where you can run or build the IPA

Alternatively, build manually:
```bash
npm run build:web
npm run cap:sync
npx cap open ios
```

## Capacitor

This project uses [Capacitor](https://capacitorjs.com/) to create native mobile apps from the web application.

### Capacitor Commands

- `npm run cap:init` - Initialize Capacitor configuration
- `npm run cap:add:android` - Add Android platform
- `npm run cap:add:ios` - Add iOS platform
- `npm run cap:sync` - Sync web build to native projects
- `npm run cap:copy` - Copy web assets to native projects

### App Configuration

- **App ID**: `net.rulequestions.ihf`
- **App Name**: IHF Rules Quiz
- **Web Directory**: `dist/ui-ihf-rules-questions/browser`

## Internationalization

The app supports multiple languages. To manage translations:

- `npm run i18n:extract` - Extract translation keys from source code
- `npm run i18n:clean` - Clean unused translation keys

Translation files are located in `public/i18n/`:
- `en.json` - English
- `nl.json` - Dutch  
- `srb.json` - Serbian

## Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run prettier:check` - Check code formatting
- `npm run prettier:write` - Format code with Prettier

## Technology Stack

- **Framework**: Angular 20
- **UI**: Tailwind CSS v3
- **Icons**: FontAwesome
- **Mobile**: Capacitor 7
- **State Management**: RxJS
- **i18n**: ngx-translate
- **GraphQL**: Apollo Angular

## Further Help

To get more help on the Angular CLI use `ng help` or check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
