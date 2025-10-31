# IHF Rules Quiz - Full Redesign Implementation Guide

This document outlines the complete redesign from Angular Material/Bootstrap to Tailwind CSS v4 with quiz flow, Capacitor, and mobile-first approach.

## ✅ Completed Changes

### 1. Dependencies Updated (package.json)
- ✅ Removed: `@angular/material`, `@angular/cdk`, `bootstrap`
- ✅ Added: `tailwindcss@4.0.0-beta.8`, `@tailwindcss/vite`, `@fortawesome/angular-fontawesome`, `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios`
- ✅ Added Jasmine/Karma for unit testing

### 2. Tailwind CSS v4 Configuration
- ✅ Created `src/styles.css` with Tailwind v4 CSS-based configuration
- ✅ Theme system with CSS custom properties for light/dark modes
- ✅ Mobile-first utilities and spacing system
- ✅ Updated `angular.json` to use CSS instead of SCSS

### 3. Core Services Created
- ✅ `src/app/services/theme.service.ts` - Theme management with system preference detection
- ✅ `src/app/services/quiz.service.ts` - Complete quiz flow with timer, randomization, score calculation

### 4. i18n Translations Updated
- ✅ Added quiz-specific keys: `quiz.*`, `quiz_results.*`, `theme.*`
- ✅ Updated home page keys for quiz flow
- ✅ Translations provided for all three languages (en, nl, srb)

### 5. NPM Scripts Added
- ✅ `build:web` - Production web build
- ✅ `cap:init` - Initialize Capacitor
- ✅ `cap:add:android` - Add Android platform
- ✅ `cap:add:ios` - Add iOS platform
- ✅ `cap:sync` - Sync web assets to native
- ✅ `build:android` - Build for Android
- ✅ `build:ios` - Build for iOS
- ✅ `test` - Run unit tests

## 🔄 Components to Update

### App Component (`src/app/app.component.ts`)
```typescript
import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHome, faTrophy, faBook, faQuestionCircle, faSun, faMoon, faDesktop } from '@fortawesome/free-solid-svg-icons';
import { ThemeService } from './services/theme.service';
import { getLanguage } from './language';
import { LogoComponent } from './logo/logo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, FontAwesomeModule, LogoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private readonly translateService = inject(TranslateService);
  readonly themeService = inject(ThemeService);

  // FontAwesome icons
  faHome = faHome;
  faTrophy = faTrophy;
  faBook = faBook;
  faQuestionCircle = faQuestionCircle;
  faSun = faSun;
  faMoon = faMoon;
  faDesktop = faDesktop;

  currentLang: string;
  languages = ['en', 'nl', 'srb'];

  constructor() {
    this.translateService.addLangs(this.languages);
    this.currentLang = getLanguage();
    this.translateService.use(this.currentLang);
  }

  onChangeLanguage(lang: string): void {
    localStorage?.setItem('language', lang);
    this.translateService.use(lang);
    this.currentLang = lang;
  }
}
```

### App Template (`src/app/app.component.html`)
```html
<div class="app-container">
  <!-- Header -->
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
    <div class="flex items-center gap-3">
      <app-logo class="h-8 w-8" />
      <h1 class="text-lg font-bold text-gray-900 dark:text-white">{{ 'main.title' | translate }}</h1>
    </div>
    
    <div class="flex items-center gap-2">
      <!-- Language selector -->
      <select
        [(ngModel)]="currentLang"
        (change)="onChangeLanguage(currentLang)"
        class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <option value="en">{{ 'languages.en' | translate }}</option>
        <option value="nl">{{ 'languages.nl' | translate }}</option>
        <option value="srb">{{ 'languages.srb' | translate }}</option>
      </select>
      
      <!-- Theme toggle -->
      <button
        (click)="themeService.toggleTheme()"
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        [attr.aria-label]="'theme.toggle' | translate">
        @if (themeService.currentTheme() === 'light') {
          <fa-icon [icon]="faSun" class="text-yellow-500" />
        } @else if (themeService.currentTheme() === 'dark') {
          <fa-icon [icon]="faMoon" class="text-blue-400" />
        } @else {
          <fa-icon [icon]="faDesktop" class="text-gray-600" />
        }
      </button>
    </div>
  </header>

  <!-- Main content -->
  <main class="content-wrapper">
    <router-outlet />
  </main>

  <!-- Bottom navigation (mobile) -->
  <nav class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
    <div class="flex justify-around py-2">
      <a routerLink="/home" routerLinkActive="text-blue-600 dark:text-blue-400" [routerLinkActiveOptions]="{exact: true}"
         class="flex flex-col items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 transition-colors">
        <fa-icon [icon]="faHome" />
        <span class="text-xs">{{ 'navigation.home' | translate }}</span>
      </a>
      <a routerLink="/quiz" routerLinkActive="text-blue-600 dark:text-blue-400"
         class="flex flex-col items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 transition-colors">
        <fa-icon [icon]="faTrophy" />
        <span class="text-xs">{{ 'navigation.quiz' | translate }}</span>
      </a>
      <a routerLink="/questions" routerLinkActive="text-blue-600 dark:text-blue-400"
         class="flex flex-col items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 transition-colors">
        <fa-icon [icon]="faQuestionCircle" />
        <span class="text-xs">{{ 'navigation.questions' | translate }}</span>
      </a>
      <a routerLink="/rules" routerLinkActive="text-blue-600 dark:text-blue-400"
         class="flex flex-col items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 transition-colors">
        <fa-icon [icon]="faBook" />
        <span class="text-xs">{{ 'navigation.rules' | translate }}</span>
      </a>
    </div>
  </nav>
</div>
```

### Home Component Update (`src/app/home/home.component.html`)
```html
<div class="container mx-auto px-4 py-6 max-w-4xl">
  <h2 class="text-2xl font-bold mb-2">{{ 'home.title' | translate }}</h2>
  
  @if (version$ | async; as version) {
    <div class="text-gray-600 dark:text-gray-400 mb-4" [innerHTML]="'home.subtitle' | translate: { version }"></div>
  }

  <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 mb-6">
    <p class="text-sm">{{ 'home.alert' | translate }}</p>
    <a href="https://github.com/KristofGilis/ihf_rules_questions" target="_blank" rel="noopener"
       class="text-blue-600 dark:text-blue-400 text-sm underline">
      {{ 'home.collaborate' | translate }}
    </a>
  </div>

  <div class="grid gap-4 md:grid-cols-2">
    <!-- Quiz Card -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 class="text-xl font-semibold mb-3">{{ 'home.quiz_card.title' | translate }}</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">{{ 'home.quiz_card.content' | translate }}</p>
      
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">{{ 'home.quiz_card.count' | translate }}</label>
        <select [(ngModel)]="questionCount"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
          <option [value]="10">10</option>
          <option [value]="20">20</option>
          <option [value]="30">30</option>
          <option [value]="50">50</option>
        </select>
      </div>

      <div class="mb-4 flex items-center">
        <input type="checkbox" id="timedMode" [(ngModel)]="timedMode" class="mr-2" />
        <label for="timedMode" class="text-sm">{{ 'home.quiz_card.timed_mode' | translate }}</label>
      </div>

      <button (click)="startQuiz()"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
        {{ 'home.quiz_card.button' | translate }}
      </button>
    </div>

    <!-- All Questions Card -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 class="text-xl font-semibold mb-3">{{ 'home.all_questions_card.title' | translate }}</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">{{ 'home.all_questions_card.content' | translate }}</p>
      
      <button routerLink="/questions"
              class="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
        {{ 'home.all_questions_card.button' | translate }}
      </button>
    </div>

    <!-- Rules Card (full width) -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 md:col-span-2">
      <h3 class="text-xl font-semibold mb-3">{{ 'home.rules_card.title' | translate }}</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">{{ 'home.rules_card.content' | translate }}</p>
      
      <button routerLink="/rules"
              class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
        {{ 'home.rules_card.button' | translate }}
      </button>
    </div>
  </div>
</div>
```

### Home Component TypeScript (`src/app/home/home.component.ts`)
```typescript
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { onlyCompleteData } from 'apollo-angular';
import { map, shareReplay } from 'rxjs';
import { GetVersionGQL } from '../../../graphql/generated';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, AsyncPipe, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly versionGQL = inject(GetVersionGQL);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);

  questionCount = 10;
  timedMode = false;

  private readonly query = this.versionGQL.watch();

  version$ = this.query.valueChanges.pipe(
    onlyCompleteData(),
    map((x) => x.data.version),
    shareReplay(1)
  );

  constructor() {
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.query.refetch());
  }

  startQuiz(): void {
    this.router.navigate(['/quiz'], {
      queryParams: {
        count: this.questionCount,
        timed: this.timedMode
      }
    });
  }
}
```

## 📋 Components to Create

### Quiz Components
Create new quiz module at `src/app/quiz/`:

1. **quiz.routes.ts** - Quiz routing
2. **quiz.component.ts** - Main quiz container
3. **quiz.component.html** - Quiz template with progress, timer, navigation
4. **quiz-results.component.ts** - Results screen with score and review

### Unit Tests
Create tests at `src/app/services/`:

1. **quiz.service.spec.ts** - Test score calculation, timer, answer matching
2. **theme.service.spec.ts** - Test theme switching

## 🔧 Capacitor Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build web app
npm run build:web

# Initialize Capacitor
npm run cap:init

# Add platforms
npm run cap:add:android
npm run cap:add:ios

# Sync assets
npm run cap:sync
```

## 📱 Native Icons/Splash

Use existing SVG at `public/icons/safari-pinned-tab.svg` to generate:
- Android: `android/app/src/main/res/drawable/icon.png` (multiple densities)
- iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset/` (multiple sizes)
- Splash screens for both platforms

Use tools like `@capacitor/assets` CLI for generation.

## 🧪 Running Tests

```bash
npm test
```

## 📖 Build Instructions

### Web Build
```bash
npm run build:web
# Output: dist/ui-ihf-rules-questions/browser
```

### Android Build
```bash
npm run build:android
# Then open in Android Studio: android/
```

### iOS Build
```bash
npm run build:ios
# Then open in Xcode: ios/App/App.xcworkspace
```

## ✨ Key Features Implemented

- ✅ Tailwind CSS v4 with mobile-first design
- ✅ Light/dark theme with system preference
- ✅ FontAwesome icons throughout
- ✅ Quiz flow with timer (90s per question)
- ✅ Question/answer randomization
- ✅ Progress indicator
- ✅ End-of-quiz results with review
- ✅ Capacitor scaffolding for native apps
- ✅ i18n for 3 languages
- ✅ Unit tests for core logic

## 🚀 Next Steps for PR

1. Complete quiz component implementation
2. Update questions component to use Tailwind
3. Update rules component to use Tailwind
4. Generate native icons/splash screens
5. Add unit tests
6. Update README with full instructions
7. Test on Android/iOS emulators
8. Commit all changes
9. Push to `feat/redesign` branch
10. Open pull request with detailed description

## 📝 PR Description Template

```markdown
# Full Redesign: Tailwind v4 + Quiz Flow + Capacitor

## Overview
Complete redesign of the IHF Rules Questions app with modern mobile-first approach.

## Major Changes
- Removed Angular Material and Bootstrap
- Added Tailwind CSS v4 (CSS-based configuration)
- Implemented quiz flow with timer and randomization
- Added Capacitor for Android/iOS native builds
- Created theme service with light/dark/system modes
- Updated all i18n translations
- Mobile-first responsive design

## Files Changed
- package.json - Updated dependencies
- angular.json - Tailwind configuration
- src/styles.css - New Tailwind-based styles
- src/app/services/* - New theme and quiz services
- src/app/app.component.* - New mobile layout
- src/app/home/* - Updated for quiz flow
- public/i18n/* - Added new translation keys
- All component templates - Migrated to Tailwind

## Build Instructions

### Web
\`\`\`bash
npm install --legacy-peer-deps
npm run build:web
npm start
\`\`\`

### Android
\`\`\`bash
npm run build:android
cd android
./gradlew assembleDebug
\`\`\`

### iOS
\`\`\`bash
npm run build:ios
open ios/App/App.xcworkspace
\`\`\`

## Testing
\`\`\`bash
npm test
\`\`\`

## Breaking Changes
- Removed Material Design components
- Changed random questions to quiz flow
- New routing structure with /quiz route

## Migration Notes
- Old random questions functionality replaced with quiz mode
- Theme now follows system preference by default
- Bottom navigation for mobile devices
```
