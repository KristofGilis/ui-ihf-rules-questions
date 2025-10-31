import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  
  currentTheme = signal<Theme>('system');
  
  constructor() {
    if (this.isBrowser) {
      this.loadTheme();
      this.applyTheme(this.currentTheme());
      
      // Listen for system preference changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.currentTheme() === 'system') {
          this.applyTheme('system');
        }
      });
    }
  }
  
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    if (this.isBrowser) {
      localStorage.setItem('theme', theme);
      this.applyTheme(theme);
    }
  }
  
  toggleTheme(): void {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(this.currentTheme());
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    this.setTheme(nextTheme);
  }
  
  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      this.currentTheme.set(savedTheme);
    }
  }
  
  private applyTheme(theme: Theme): void {
    if (!this.isBrowser) return;
    
    const root = document.documentElement;
    
    if (theme === 'system') {
      root.removeAttribute('data-theme');
      return;
    }
    
    root.setAttribute('data-theme', theme);
  }
  
  getEffectiveTheme(): 'light' | 'dark' {
    if (!this.isBrowser) return 'light';
    
    const theme = this.currentTheme();
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }
}
