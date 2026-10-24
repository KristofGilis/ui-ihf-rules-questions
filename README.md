# IHF Rules Quiz 🤾‍♂️

An interactive quiz application for testing knowledge of International Handball Federation (IHF) rules. Built with Angular 22 and Tailwind CSS, featuring multi-language support and comprehensive accessibility.

[![Angular](https://img.shields.io/badge/Angular-22-red)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)](https://www.typescriptlang.org/)
[![GraphQL](https://img.shields.io/badge/GraphQL-16.12-pink)](https://graphql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38bdf8)](https://tailwindcss.com/)

## ✨ Features

### Quiz System

- **Interactive Quizzes** - Multiple choice questions with instant feedback
- **Two Modes** - Timed (90s per question) or untimed practice
- **Smart Scoring** - Backend calculation for security
- **Progress Tracking** - Visual progress bar and question counter
- **Completion Time** - Track how long you took (timed mode only)
- **Detailed Results** - Review all questions with correct/incorrect highlights
- **Question Shuffling** - Randomized order using Fisher-Yates algorithm

### Content Browser

- **All Questions** - Browse and study all available questions
- **Rules Explorer** - Navigate questions by specific IHF rule
- **Instant Scoring** - Calculate your score while browsing

### User Experience

- **Multi-Language** - English, Dutch, French, Serbian (Cyrillic)
- **Theme System** - Light, Dark, or System preference
- **PWA Support** - Install on any device, works offline
- **Fully Accessible** - WCAG 2.1 AA compliant
- **Responsive Design** - Optimized for all screen sizes
- **Touch Gestures** - Swipe navigation on mobile devices

## 🏗️ Architecture

### Tech Stack

- **Framework**: Angular 22 with Signals
- **State Management**: Signal-based reactive state
- **API**: GraphQL via Apollo Client
- **Styling**: Tailwind CSS 4
- **i18n**: ngx-translate
- **Build**: Angular CLI with Vite

### Key Patterns

- **Standalone Components** - No NgModules, fully modular
- **OnPush Change Detection** - Performance optimized
- **Lazy Loading** - Code splitting for all routes
- **Signal-based State** - Modern reactive patterns
- **Service-Oriented** - Clear separation of concerns

### Project Structure

```
src/app/
├── home/              # Landing page with quiz setup
├── quiz/              # Quiz taking experience
│   ├── services/      # Quiz state management
│   ├── guards/        # Route protection
│   ├── quiz-setup/    # Configure quiz parameters
│   └── quiz-results/  # Results and review page
├── questions/         # Browse all questions
├── rules/             # Rules explorer
├── shared/            # Reusable components & services
│   ├── components/    # UI components
│   └── services/      # App-wide services
└── services/          # Global services (theme, etc.)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 22+ and npm
- Angular CLI 22+ (optional, but recommended)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/KristofGilis/ui-ihf-rules-questions.git
   cd ui-ihf-rules-questions
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API endpoint** (if needed)

   The GraphQL API endpoint is configured in `src/app/graphql.provider.ts`:

   ```typescript
   const uri = 'https://api-ihf-rules-questions.azurewebsites.net/graphql';
   ```

4. **Start development server**
   ```bash
   npm start
   ```
   Navigate to `http://localhost:4200/`

## 📜 Available Scripts

### Development

- `npm start` - Start dev server (port 4200)
- `npm run watch` - Build with watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run prettier:check` - Check code formatting
- `npm run prettier:write` - Format all files

### Build

- `npm run build` - Development build
- `npm run build:web` - Production build for web

### Internationalization

- `npm run i18n:extract` - Extract translation strings
- `npm run i18n:clean` - Remove unused translations

### GraphQL

- `npm run generate` - Generate TypeScript types from GraphQL schema

## 📱 Progressive Web App (PWA)

This application is a fully-featured PWA that works offline and can be installed on any device.

### Installation

1. Visit the app in a modern browser (Chrome, Edge, Safari, Firefox)
2. Look for the "Install" prompt in the address bar
3. Click "Install" to add to your home screen
4. The app will work offline with cached data

### PWA Features

- **Offline Support** - Service Worker caches assets for offline use
- **Install Prompt** - Add to home screen on mobile and desktop
- **App Shortcuts** - Quick access to "Browse Rules" and "Start Quiz"
- **Standalone Mode** - Runs like a native app when installed

Native Android and iOS projects are now included via Capacitor. See [Mobile release guide](docs/MOBILE_RELEASE.md) for build, testing, and store preparation steps. Offline questions become available after the first successful data sync.

## 🌍 Internationalization

The app supports 4 languages out of the box:

- 🇬🇧 English (en)
- 🇳🇱 Dutch (nl)
- 🇫🇷 French (fr)
- 🇷🇸 Serbian (srb) - Cyrillic script

### Adding a New Language

1. **Add translation file**

   ```bash
   cp public/i18n/en.json public/i18n/fr.json
   ```

2. **Translate the content**
   Edit `public/i18n/fr.json` with translations

3. **Update language list**

   In `src/app/app.component.ts`:

   ```typescript
   private readonly LANGUAGES = ['en', 'nl', 'srb', 'fr'] as const;
   ```

4. **Update language detection**

   In `src/app/language.ts`:

   ```typescript
   const browserLanguage = translateService.getBrowserLang()?.match(/en|nl|sr|fr/);
   ```

5. **Add to UI**

   Add button in `src/app/app.component.html` language menu

## 🎨 Theming

The app supports three theme modes:

- **Light** - Bright, high contrast
- **Dark** - Easy on the eyes
- **System** - Follows OS preference

Themes are managed by `ThemeService` and persist in localStorage.

### Customizing Colors

Edit Tailwind configuration or CSS variables in your styles to customize the color scheme.

## ♿ Accessibility

This application is built with accessibility as a priority:

- ✅ **WCAG 2.1 AA Compliant**
- ✅ **Keyboard Navigation** - Full keyboard support with visible focus
- ✅ **Screen Reader Support** - ARIA landmarks, labels, and live regions
- ✅ **Semantic HTML** - Proper heading hierarchy and form structure
- ✅ **Skip Links** - Bypass navigation for keyboard users
- ✅ **High Contrast** - Clear visual indicators in all themes

## 📦 Deployment

The application uses a two-tier deployment strategy:

- **Production**: Azure Web App (automatic on `main` branch)

### Quick Deploy

Build for production:

```bash
npm run build:web
```

Output will be in `dist/ui-ihf-rules-questions/browser/`

### Deployment Platforms

The production build can be deployed to any static hosting:

- ✅ **Azure Static Web Apps** (current production)
- 🔄 Netlify
- 🔄 GitHub Pages
- 🔄 Firebase Hosting

### Service Worker

The app includes a service worker configuration (`ngsw-config.json`) for PWA support. It's automatically enabled in production builds.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow the existing code style
- Use meaningful variable names
- Add comments for complex logic
- Ensure accessibility compliance
- Test in multiple languages
- Verify mobile responsiveness

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- IHF (International Handball Federation) for the official rules
- All contributors who help translate and improve the app
- The Angular team for an amazing framework

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for the handball community**
