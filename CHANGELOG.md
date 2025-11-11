# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking Changes

- **Complete UI Redesign**: Migrated from Angular Material to Tailwind CSS 4
  - All Material Design components replaced with custom Tailwind-based components
  - New visual design system with custom color palette (cyan primary)
  - Improved mobile-first responsive design
  - Enhanced accessibility with better focus states and ARIA labels
- **Capacitor Removed**: Native mobile apps (iOS/Android) temporarily removed
  - Focus on perfecting PWA experience first
  - Mobile apps will be re-implemented in future release with proper asset generation
  - Removed all Capacitor dependencies and configuration files

### Added

- **New Design System**: Complete Tailwind CSS 4 implementation
  - Custom gradient buttons with hover/active/disabled states
  - Consistent spacing and typography system
  - Mobile-optimized dialogs and overlays
  - Enhanced dark mode with proper contrast ratios
- **Development Tooling**:
  - Semantic-release for automated versioning
  - Commitlint + Husky for conventional commits enforcement
  - Prettier with Tailwind plugin for consistent formatting
- **Security Headers**: Content Security Policy (CSP), X-Frame-Options, X-Content-Type-Options, and Referrer-Policy headers in index.html
- **Offline Detection**: Real-time offline/online status detection with visual banner in 3 languages (EN, NL, SRB)
- **Touch Gestures**: Swipe left/right support for quiz navigation using HammerJS
- **Automated Accessibility Testing**: Integrated axe-core with Playwright E2E tests for WCAG 2.1 AA compliance
- **API Debouncing**: 300ms debounce on score calculation requests to reduce API load
- **Performance Monitoring**:
  - Increased Sentry trace sample rate to 20% for better insights
  - Added performance marks for quiz start/complete tracking
- **CI/CD Enhancements**:
  - E2E tests now run in GitHub Actions before deployment
  - PR preview deployments to Azure slots with automatic commenting
- **Documentation**:
  - `CONTRIBUTING.md` with comprehensive setup and coding guidelines
  - `ADR-001`: Architecture Decision Record for Signals over NgRx
  - `ADR-002`: Architecture Decision Record for Apollo Client
  - `CHANGELOG.md` for tracking version history
- **PWA Enhancements**:
  - Added shortcuts to manifest for quick access to "Browse Rules" and "Start Quiz"
  - Added 512x512 icon for better app store compatibility
  - Enhanced iOS PWA support with apple-mobile-web-app meta tags
  - Improved manifest description and display mode (standalone)
- **SEO Optimization**:
  - Comprehensive meta tags including Open Graph and Twitter Card
  - Resource hints (preconnect, dns-prefetch) for faster resource loading
  - Optimized robots.txt and sitemap.xml with proper Azure domain
  - Meta description for better search engine visibility
- **Performance Optimization**:
  - Deferred Sentry initialization with 100ms timeout to avoid blocking render
  - Disabled source maps in production build for smaller bundle size
  - Optimized font handling (inline: false)
  - Build progress reporting disabled for cleaner CI output
- **UX Improvements**:
  - Checkboxes now disabled when perfect score (100%) is achieved
  - Prevents users from changing answers after completing quiz with 100%
  - Added comprehensive test coverage for disabled checkbox behavior

### Changed

- **UI Framework**: Complete migration from Angular Material to Tailwind CSS
- **Component Architecture**: All components rewritten with custom Tailwind styling
- **Theme System**: Enhanced dark mode implementation with CSS variables
- **Mobile Navigation**: Improved responsive menu and dialog systems
- **Test Suite**: Updated all component tests to match new Tailwind components (645 tests passing)
- Sentry performance monitoring trace sample rate increased from 10% to 20% in production
- PWA manifest display mode changed from `fullscreen` to `standalone` for better UX

### Fixed

- **UX Bug**: Users can no longer modify answers after achieving 100% score on rules or questions pages
- Vercel SPA routing configuration with proper rewrite rules

### Dependencies

- **Removed**:
  - `@angular/material` and `@angular/cdk` (replaced with Tailwind CSS)
  - `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios` (native apps removed)
  - `@capacitor/action-sheet`, `@capacitor/splash-screen` (Capacitor plugins)
  - `@capacitor/assets` (asset generation tool)
- **Added**:
  - `@axe-core/playwright` for automated accessibility testing
  - `hammerjs` and `@types/hammerjs` for touch gesture support
  - `semantic-release` for automated version management
  - `@commitlint/cli` and `@commitlint/config-conventional` for commit message linting
  - `husky` for git hooks
  - `prettier-plugin-tailwindcss` for consistent Tailwind class ordering

### Performance Metrics

- Lighthouse Performance: **89** (improved from 60)
- First Contentful Paint: **2.3s** (improved from 6.3s on local)
- Largest Contentful Paint: **3.1s**
- Accessibility: **100**
- Best Practices: **96**
- SEO: **100** (on production, 63 on Vercel previews due to noindex header)

## [2024-11-08] - Test Coverage Improvements

### Changed

- Improved test coverage from ~80% to **97.52%** across entire codebase
- Fixed flaky async tests in ScrollRestorationService
- Improved horizontal scrolling test navigation flow

### Added

- Comprehensive tests for QuizComponent (37 tests, 100% coverage)
- Comprehensive tests for RuleComponent (100% coverage)
- Comprehensive tests for AppComponent (100% coverage)
- Comprehensive tests for QuestionsViewComponent (100% coverage)
- Tests for CanDeactivateQuizGuard (9 tests, 100% coverage)
- Tests for ConfirmationDialogService (10 tests, 100% coverage)
- Tests for ToastService (100% coverage)
- Tests for ThemeService (97.72% coverage)
- Tests for GlobalErrorHandler (98.5% coverage)
- Tests for QuizService error handling
- Tests for RulesComponent and QuestionsComponent
- Tests for RulesViewComponent and HomeComponent
- Tests for dialog and card components
- Tests for presentation components

### Fixed

- ScrollRestorationService async test timeouts by clearing mock between navigations
- Horizontal scrolling test navigation logic
- Scroll restoration test navigation flow
- Spy on translateService.instant instead of mocking

## [2024-11-07] - Production Configuration

### Added

- GitHub Actions workflow with lint, test, build, and size-check steps
- Environment file replacement for production builds (`environment.prod.ts`)

### Changed

- Configured fileReplacements to use `environment.prod.ts` for production builds

## [Initial Release]

### Added

- Angular 20.3 standalone component architecture with Signals
- GraphQL integration with Apollo Client 4.0
- Three main sections: Home, Rules, Questions
- Quiz functionality with score calculation
- Rules browser with search and filtering
- Multi-language support (English, Dutch, Serbian)
- Theme switching (Light, Dark, System)
- Progressive Web App (PWA) support with Service Worker
- Mobile app support via Capacitor (iOS/Android)
- Sentry error tracking and performance monitoring
- Jest testing framework with 646 tests
- Playwright E2E testing
- Tailwind CSS for styling
- Responsive design for mobile and desktop
- Accessibility features (ARIA labels, keyboard navigation, focus management)

### Features

- **Quiz Mode**: Interactive handball rules quiz with random questions
- **Rules Browser**: Searchable, filterable rules database
- **Score Tracking**: Real-time score calculation
- **Offline Support**: Service Worker caching for offline access
- **Multi-platform**: Web (PWA), iOS, Android via single codebase
- **Internationalization**: Complete i18n support with language switcher
- **Dark Mode**: System preference detection with manual override
- **Touch-Friendly**: Optimized for mobile with native action sheets

### Technical Stack

- **Framework**: Angular 20.3 with standalone components
- **State Management**: Angular Signals
- **Data Layer**: Apollo Client 4.0 with GraphQL
- **Testing**: Jest (unit) + Playwright (E2E)
- **Styling**: Tailwind CSS 4.1 (upgraded from Angular Material)
- **Mobile**: PWA only (Capacitor removed, will be re-added in future release)
- **Testing**: Jest (unit) + Playwright (E2E)
- **Monitoring**: Sentry
- **CI/CD**: GitHub Actions + Azure Static Web Apps

---

## Version History Summary

- **Unreleased**: Security, performance, accessibility, and documentation improvements
- **2024-11-08**: Test coverage improvements to 97.52%
- **2024-11-07**: Production configuration and CI/CD setup
- **Initial Release**: Core application with quiz, rules, multi-language support

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## Architecture Decisions

See [docs/ADR/](./docs/ADR/) for architectural decision records.
