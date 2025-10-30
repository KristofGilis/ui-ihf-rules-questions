import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _window = this._document.defaultView;
  private readonly _localStorage = this._window?.localStorage;

  // Signal for current theme
  private readonly _theme = signal<Theme>(this._getInitialTheme());
  
  // Observable created once in constructor (injection context)
  public readonly theme$: Observable<Theme>;

  constructor() {
    // Create observable in injection context
    this.theme$ = toObservable(this._theme);
    
    // Effect to apply theme changes to document body
    effect(() => {
      const theme = this._theme();
      this._applyTheme(theme);
    });
  }

  /**
   * Get the current theme as a signal
   */
  get theme() {
    return this._theme.asReadonly();
  }

  /**
   * Get the current theme value
   */
  get currentTheme(): Theme {
    return this._theme();
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme = this._theme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: Theme): void {
    this._theme.set(theme);
    this._localStorage?.setItem('theme', theme);
  }

  /**
   * Get the initial theme based on localStorage or system preference
   */
  private _getInitialTheme(): Theme {
    // Check localStorage first
    const stored = this._localStorage?.getItem('theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    // Fall back to system preference
    if (this._window?.matchMedia) {
      const prefersDark = this._window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }

    // Default to light theme
    return 'light';
  }

  /**
   * Apply theme class to document body
   */
  private _applyTheme(theme: Theme): void {
    const body = this._document.body;
    if (theme === 'dark') {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
    }
  }
}
