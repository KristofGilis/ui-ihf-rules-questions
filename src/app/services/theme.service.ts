import { DestroyRef, inject, Service, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Service()
export class ThemeService {
  private readonly _destroyRef = inject(DestroyRef);

  private readonly _currentTheme = signal<Theme>('system');
  readonly currentTheme = this._currentTheme.asReadonly();

  // Get theme colors from CSS variables (defined in styles.css)
  private getThemeColors() {
    const styles = getComputedStyle(document.documentElement);
    return {
      light: styles.getPropertyValue('--color-bg-light').trim(),
      dark: styles.getPropertyValue('--color-bg-dark').trim(),
    };
  }

  constructor() {
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

  setTheme(theme: Theme): void {
    this._currentTheme.set(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      this._currentTheme.set(savedTheme);
    }
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    const colors = this.getThemeColors();

    if (theme === 'system') {
      root.removeAttribute('data-theme');
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
        root.style.backgroundColor = colors.dark;
      } else {
        root.classList.remove('dark');
        root.style.backgroundColor = colors.light;
      }
      return;
    }

    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = colors.dark;
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = colors.light;
    }
  }

  getEffectiveTheme(): 'light' | 'dark' {
    const theme = this.currentTheme();
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }
}
