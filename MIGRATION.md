# Migration Guide - Redesign Implementation

This document describes the major changes introduced in the redesign and how to work with the new features.

## Overview

This redesign introduces several major enhancements:
- **Capacitor Integration**: Native mobile app support for Android and iOS
- **Tailwind CSS**: Modern utility-first CSS framework
- **Enhanced Quiz Engine**: Improved quiz experience with timers, randomization, and better feedback
- **Theme System**: Light/dark mode with system preference detection

## New Dependencies

### Added
- `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios`: Native mobile app support
- `tailwindcss`, `postcss`, `autoprefixer`: Modern CSS framework
- `@fortawesome/fontawesome-free`: Icon library

### Retained
- `@angular/material`: Kept for gradual migration
- All existing dependencies remain functional

## New NPM Scripts

```bash
# Web builds
npm run build:web          # Production web build

# Capacitor operations
npm run cap:init           # Initialize Capacitor (already done)
npm run cap:add:android    # Add Android platform (already done)
npm run cap:add:ios        # Add iOS platform (already done)
npm run cap:sync           # Sync web build to native projects

# Mobile builds
npm run build:android      # Build and open Android Studio
npm run build:ios          # Build and open Xcode
```

## New Services

### ThemeService
Located at `src/app/services/theme.service.ts`

Manages application theme (light/dark/system):
```typescript
import { ThemeService } from './services/theme.service';

// Inject service
themeService = inject(ThemeService);

// Get current theme
const theme = themeService.theme(); // 'light' | 'dark' | 'system'

// Get effective theme (resolves 'system' to actual theme)
const effective = themeService.effectiveTheme(); // 'light' | 'dark'

// Set theme
themeService.setTheme('dark');

// Toggle between light and dark
themeService.toggleTheme();
```

### QuizStateService
Located at `src/app/questions/services/quiz-state.service.ts`

Manages complete quiz flow with timers and randomization:

```typescript
import { QuizStateService, QuizConfig } from './services/quiz-state.service';

// Inject service
quizService = inject(QuizStateService);

// Start a quiz
const config: QuizConfig = {
  timedMode: true,
  timePerQuestion: 90,
  randomizeQuestions: true,
  randomizeAnswers: true
};
quizService.startQuiz(questions, config);

// Access quiz state
const session = quizService.session();
const currentQuestion = quizService.currentQuestion();
const progress = quizService.progress();
const timeRemaining = quizService.timeRemaining();

// Select answers (supports multiple)
quizService.selectAnswer(questionId, answerId);

// Navigation
quizService.nextQuestion();
quizService.previousQuestion();

// Complete and get results
quizService.completeQuiz();
const results = quizService.calculateResults();

// Reset
quizService.resetQuiz();
```

## Components

### ThemeToggleComponent
Located at `src/app/components/theme-toggle/theme-toggle.component.ts`

Standalone component that provides a theme toggle button:
```html
<app-theme-toggle />
```

## Styling Changes

### CSS Custom Properties
Theme colors are now available as CSS custom properties:

```css
/* Theme colors (automatically switch based on theme) */
var(--color-primary)
var(--color-secondary)
var(--color-background)
var(--color-surface)
var(--color-text)
var(--color-text-muted)
var(--color-border)
var(--color-success)
var(--color-error)
var(--color-warning)
```

### Tailwind CSS
Tailwind utility classes are now available:

```html
<!-- Responsive utilities -->
<div class="flex flex-col md:flex-row">
  <div class="p-4 bg-gray-100">Content</div>
</div>

<!-- Custom theme classes -->
<div class="theme-light">Light theme content</div>
<div class="theme-dark">Dark theme content</div>
```

## Translation Keys

New translation keys added for quiz features:

### English (en.json)
```json
{
  "quiz": {
    "complete": "Complete Quiz",
    "next": "Next Question",
    "previous": "Previous Question",
    "progress": "Question {{current}} of {{total}}",
    "select_answers": "Select all correct answers",
    "start": "Start Quiz",
    "time_remaining": "Time remaining: {{time}}s",
    "timed_mode": "Timed Mode",
    "timed_mode_description": "90 seconds per question"
  },
  "quiz_results": {
    "correct": "Correct",
    "correct_answers": "Correct Answers",
    "incorrect": "Incorrect",
    "percentage": "Score",
    "review": "Review Your Answers",
    "time_taken": "Time Taken",
    "title": "Quiz Results",
    "total_questions": "Total Questions",
    "wrong_answers": "Wrong Answers",
    "your_answer": "Your Answer",
    "correct_answer": "Correct Answer"
  }
}
```

Similar keys exist for Dutch (nl.json) and Serbian (srb.json).

## Mobile App Build Process

### Android
1. Build web app: `npm run build:web`
2. Sync to Android: `npm run cap:sync`
3. Open Android Studio: `npm run build:android`
4. In Android Studio:
   - Build APK: Build > Build Bundle(s) / APK(s) > Build APK(s)
   - Build AAB: Build > Build Bundle(s) / APK(s) > Build Bundle(s)

### iOS
1. Build web app: `npm run build:web`
2. Sync to iOS: `npm run cap:sync`
3. Open Xcode: `npm run build:ios`
4. In Xcode:
   - Select your development team
   - Build for device: Product > Build
   - Archive: Product > Archive

## Testing

### Unit Tests
Tests are located alongside source files:
- `src/app/questions/services/quiz-state.service.spec.ts`

To set up test runner (Jest):
```bash
npm install --save-dev @types/jest jest jest-preset-angular
```

Then add to package.json:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

## Breaking Changes

None. All existing functionality is preserved.

## Migration Steps for Developers

1. **Pull latest changes**: `git pull origin feat/redesign`
2. **Install dependencies**: `npm install`
3. **Build project**: `npm run build:web`
4. **Run locally**: `npm start`

## Future Enhancements

### Recommended Next Steps
1. **Set up Jest**: Enable running the comprehensive unit tests
2. **UI Migration**: Gradually migrate remaining components from Angular Material to Tailwind
3. **Bottom Navigation**: Add mobile bottom navigation for better UX
4. **Enhanced Icons**: Use custom app icons instead of placeholders
5. **Splash Screens**: Design custom splash screens

## Support

For questions or issues:
- Check existing GitHub issues
- Review the updated README.md
- Consult this migration guide
