import { Injectable, signal, computed, DOCUMENT, inject } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _theme = signal<Theme>('system');
  private _mediaQuery: MediaQueryList | null = null;

  readonly theme = this._theme.asReadonly();
  
  readonly effectiveTheme = computed(() => {
    const theme = this._theme();
    if (theme === 'system') {
      return this.getSystemTheme();
    }
    return theme;
  });

  constructor() {
    // Load saved theme preference
    const savedTheme = this.loadThemePreference();
    if (savedTheme) {
      this.setTheme(savedTheme);
    }

    // Listen for system theme changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      this._mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this._mediaQuery.addEventListener('change', () => {
        if (this._theme() === 'system') {
          this.applyTheme(this.getSystemTheme());
        }
      });
    }

    // Apply initial theme
    this.applyTheme(this.effectiveTheme());
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
    this.saveThemePreference(theme);
    this.applyTheme(this.effectiveTheme());
  }

  toggleTheme(): void {
    const currentEffective = this.effectiveTheme();
    const newTheme = currentEffective === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  private getSystemTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    const body = this._document.body;
    body.classList.remove('theme-light', 'theme-dark');
    body.classList.add(`theme-${theme}`);
  }

  private saveThemePreference(theme: Theme): void {
    try {
      const localStorage = this._document.defaultView?.localStorage;
      localStorage?.setItem('theme', theme);
    } catch (e) {
      // localStorage might not be available
      console.warn('Failed to save theme preference:', e);
    }
  }

  private loadThemePreference(): Theme | null {
    try {
      const localStorage = this._document.defaultView?.localStorage;
      const saved = localStorage?.getItem('theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch (e) {
      // localStorage might not be available
      console.warn('Failed to load theme preference:', e);
    }
    return null;
  }
}
