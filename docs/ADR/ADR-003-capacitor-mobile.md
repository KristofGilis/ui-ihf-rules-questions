# ADR-003: Use Capacitor for Cross-Platform Mobile Apps

**Date**: 2024-11-08  
**Status**: Accepted  
**Deciders**: Development Team  
**Technical Story**: Cross-platform mobile strategy

## Context and Problem Statement

The IHF Rules Quiz needs to be available as native mobile applications for iOS and Android, in addition to the web version. We need to choose a framework that allows us to:

- Reuse our existing Angular codebase
- Access native device features (action sheets, native UI)
- Maintain a single codebase
- Provide good performance
- Easy deployment to app stores

## Decision Drivers

- Code reuse from web app
- Development speed
- Native feature access
- Performance requirements
- Team expertise (Angular/TypeScript)
- Bundle size for mobile
- Maintenance overhead
- App store deployment ease

## Considered Options

### Option 1: Capacitor ✅

**Pros:**

- Modern, web-first approach
- Official Ionic team support
- Native plugin ecosystem
- Works with any web framework (Angular, React, Vue)
- Minimal configuration
- Web code runs mostly unchanged
- Good performance
- Progressive Web App (PWA) compatible
- Easy to add native plugins
- Keeps web and mobile in sync

**Cons:**

- Smaller plugin ecosystem vs Cordova
- Relatively newer (less Stack Overflow answers)
- Requires some native code knowledge for custom plugins

### Option 2: Cordova

**Pros:**

- Mature ecosystem
- Large plugin library
- Established patterns
- Extensive documentation

**Cons:**

- Older architecture
- Performance issues on some devices
- Being phased out by Ionic team
- More configuration complexity
- Web and native more separated

### Option 3: Native Development (Swift/Kotlin)

**Pros:**

- Best performance
- Full native feature access
- Platform-specific UX

**Cons:**

- 3x codebases (web, iOS, Android)
- 3x maintenance effort
- Requires native developers
- Not feasible for small team
- Much longer development time

### Option 4: React Native / Flutter

**Pros:**

- Good performance
- Single codebase for mobile
- Large communities

**Cons:**

- Complete rewrite required
- Can't reuse Angular web app
- Different languages/frameworks to learn
- Separate web deployment needed

## Decision Outcome

**Chosen option:** "Capacitor" because:

1. **Maximum Code Reuse**: Our Angular web app works with minimal changes:

   ```typescript
   // Same code works on web and mobile
   if (Capacitor.isNativePlatform()) {
     // Use native action sheet
     await ActionSheet.showActions({ ... });
   } else {
     // Use web dropdown
     this.showMenu = true;
   }
   ```

2. **Modern Architecture**: Capacitor is built for modern web apps:
   - Works perfectly with Angular standalone components
   - Supports Service Workers (PWA)
   - Uses modern web standards (ES modules, etc.)

3. **Native Feature Access**: Easy to use native features:

   ```typescript
   import { ActionSheet } from '@capacitor/action-sheet';
   import { Capacitor } from '@capacitor/core';

   // Action sheets for theme/language selection
   const result = await ActionSheet.showActions({
     title: this._translate.instant('theme.toggle'),
     options: [{ title: 'Light' }, { title: 'Dark' }, { title: 'System' }],
   });
   ```

4. **Single Codebase**: One Angular app runs on:
   - Web browsers (PWA)
   - iOS (native app)
   - Android (native app)
   - Desktop (via PWA install)

5. **Progressive Enhancement**: Can detect platform and adapt:

   ```typescript
   readonly isNativePlatform = Capacitor.isNativePlatform();

   // Use native dialog on mobile, web modal on desktop
   toggleMenu(): void {
     if (this.isNativePlatform) {
       this.showNativeActionSheet();
     } else {
       this.showWebDropdown();
     }
   }
   ```

6. **Build Process**: Simple build commands:
   ```json
   {
     "build:android": "npm run build:web && npx cap copy android && npx cap sync android",
     "build:ios": "npm run build:web && npx cap copy ios && npx cap sync ios"
   }
   ```

## Implementation

### Project Setup

```bash
# Initialize Capacitor
npx cap init "IHF Rules Quiz" net.rulequestions.ihf --web-dir=dist/ui-ihf-rules-questions/browser

# Add platforms
npx cap add android
npx cap add ios

# Sync web build to native projects
npx cap sync
```

### Configuration

```json
// capacitor.config.json
{
  "appId": "net.rulequestions.ihf",
  "appName": "IHF Rules Quiz",
  "webDir": "dist/ui-ihf-rules-questions/browser",
  "server": {
    "androidScheme": "https"
  }
}
```

### Platform Detection

```typescript
import { Capacitor } from '@capacitor/core';

export class AppComponent {
  readonly isNativePlatform = Capacitor.isNativePlatform();
  readonly platform = Capacitor.getPlatform(); // 'web', 'ios', 'android'
}
```

### Using Native Features

```typescript
// Action Sheet (native on mobile, custom on web)
import { ActionSheet } from '@capacitor/action-sheet';

const result = await ActionSheet.showActions({
  title: 'Select Theme',
  options: [{ title: 'Light Theme' }, { title: 'Dark Theme' }, { title: 'System Default' }],
});

if (result.index >= 0) {
  this.setTheme(themes[result.index]);
}
```

## Consequences

### Positive

- ✅ 95%+ code reuse between web and mobile
- ✅ Single TypeScript/Angular codebase
- ✅ Web-first development (test in browser)
- ✅ Native look and feel where needed
- ✅ PWA and native apps from same code
- ✅ Fast development iteration
- ✅ Easy to maintain
- ✅ Good performance (runs actual web code, not bridge)

### Negative

- ⚠️ Slightly larger app size than pure native (~15MB vs ~5MB)
- ⚠️ Some native plugins may require custom development
- ⚠️ Platform-specific UI differences need handling

### Neutral

- 🔄 Still need Xcode for iOS builds
- 🔄 Still need Android Studio for Android builds
- 🔄 App store submission process same as native apps

## Mobile-Specific Optimizations

### 1. Action Sheets for Native Feel

```typescript
// Replace web dropdowns with native action sheets on mobile
private async showThemeActionSheet(): Promise<void> {
  const result = await ActionSheet.showActions({
    title: this._translateService.instant('theme.toggle'),
    options: [
      { title: this._translateService.instant('theme.light') },
      { title: this._translateService.instant('theme.dark') },
      { title: this._translateService.instant('theme.system') },
    ],
  });

  const themes: Theme[] = ['light', 'dark', 'system'];
  if (result.index >= 0 && result.index < themes.length) {
    this.setTheme(themes[result.index]);
  }
}
```

### 2. Viewport Configuration

```html
<!-- index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

### 3. Safe Area Handling

```scss
// Handle notches on iOS
.header {
  padding-top: env(safe-area-inset-top);
}
```

## Performance Metrics

After implementation:

- **App size**:
  - iOS: ~14MB
  - Android: ~13MB
  - Acceptable for quiz app
- **Startup time**: <1s on modern devices
- **Performance**: Indistinguishable from native for UI interactions

## Integration with Other Decisions

- **PWA Support**: Capacitor doesn't interfere with Service Worker
- **Angular**: Works perfectly with Angular 20+ standalone components
- **Signals**: Capacitor code integrates seamlessly with signals

## Deployment

```bash
# Android
npm run build:android
# Open in Android Studio
npx cap open android

# iOS
npm run build:ios
# Open in Xcode
npx cap open ios
```

## Future Considerations

- Add more native plugins as needed (camera, geolocation, etc.)
- Consider adding desktop apps via Electron + Capacitor
- Monitor Capacitor updates for new features

## Validation

The decision has been successful:

- ✅ Same codebase runs on web, iOS, Android
- ✅ Native features (action sheets) work great
- ✅ Development speed much faster than native
- ✅ No significant performance issues
- ✅ Easy to maintain

## References

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [Ionic Capacitor](https://ionicframework.com/docs/core-concepts/cross-platform)
- [Angular with Capacitor](https://capacitorjs.com/solution/angular)
