import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _localStorage = this._document.defaultView?.localStorage;

  readonly theme = signal<Theme>(this._getInitialTheme());

  constructor() {
    this._applyTheme(this.theme());
    
    // Listen for system theme changes
    if (this._document.defaultView?.matchMedia) {
      const mediaQuery = this._document.defaultView.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.theme() === 'auto') {
          this._applyTheme('auto');
        }
      });
    }
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    this._localStorage?.setItem('theme', theme);
    this._applyTheme(theme);
  }

  toggleTheme(): void {
    const currentTheme = this.theme();
    const newTheme = currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'auto' : 'light';
    this.setTheme(newTheme);
  }

  private _getInitialTheme(): Theme {
    const savedTheme = this._localStorage?.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      return savedTheme;
    }
    return 'auto';
  }

  private _applyTheme(theme: Theme): void {
    const root = this._document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'dark') {
      root.classList.add('dark');
    }
    // For 'auto', rely on CSS @media (prefers-color-scheme: dark)
  }
}
