import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _window = this._document.defaultView;
  
  readonly themeMode = signal<ThemeMode>(this._loadThemeMode());
  
  constructor() {
    this._applyTheme();
    this._watchSystemTheme();
  }

  toggleTheme(): void {
    const modes: ThemeMode[] = ['system', 'light', 'dark'];
    const currentIndex = modes.indexOf(this.themeMode());
    const nextMode = modes[(currentIndex + 1) % modes.length];
    this.setTheme(nextMode);
  }

  setTheme(mode: ThemeMode): void {
    this.themeMode.set(mode);
    this._window?.localStorage?.setItem('theme', mode);
    this._applyTheme();
  }

  private _loadThemeMode(): ThemeMode {
    const stored = this._window?.localStorage?.getItem('theme');
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'system';
  }

  private _applyTheme(): void {
    const root = this._document.documentElement;
    const mode = this.themeMode();
    
    if (mode === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', mode);
    }
  }

  private _watchSystemTheme(): void {
    if (!this._window?.matchMedia) return;
    
    const mediaQuery = this._window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.themeMode() === 'system') {
        this._applyTheme();
      }
    });
  }

  getCurrentEffectiveTheme(): 'light' | 'dark' {
    const mode = this.themeMode();
    if (mode === 'system') {
      return this._window?.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return mode;
  }
}
