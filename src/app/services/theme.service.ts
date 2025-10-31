import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _isBrowser = isPlatformBrowser(this._platformId);

  private readonly _currentTheme = signal<Theme>('system');
  readonly currentTheme = this._currentTheme.asReadonly();

  constructor() {
    if (this._isBrowser) {
      this.loadTheme();
      this.applyTheme(this.currentTheme());

      // Listen for system preference changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => {
        if (this.currentTheme() === 'system') {
          this.applyTheme('system');
        }
      };
      mediaQuery.addEventListener('change', listener);

      // Cleanup listener on service destruction
      this._destroyRef.onDestroy(() => {
        mediaQuery.removeEventListener('change', listener);
      });
    }
  }

  setTheme(theme: Theme): void {
    this._currentTheme.set(theme);
    if (this._isBrowser) {
      localStorage.setItem('theme', theme);
      this.applyTheme(theme);
    }
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      this._currentTheme.set(savedTheme);
    }
  }

  private applyTheme(theme: Theme): void {
    if (!this._isBrowser) return;

    const root = document.documentElement;

    if (theme === 'system') {
      root.removeAttribute('data-theme');
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      return;
    }

    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  getEffectiveTheme(): 'light' | 'dark' {
    if (!this._isBrowser) return 'light';

    const theme = this.currentTheme();
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }
}
