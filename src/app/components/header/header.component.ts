import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  imports: [TranslatePipe, FormsModule],
  template: `
    <header class="sticky top-0 z-50 w-full border-b" style="background-color: var(--surface-color); border-color: var(--border-color);">
      <div class="container mx-auto px-4">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center gap-4">
            <h1 class="text-xl font-bold md:text-2xl">{{ 'main.title' | translate }}</h1>
          </div>

          <div class="flex items-center gap-2">
            <!-- Language Selector -->
            <select
              [(ngModel)]="currentLang"
              (change)="onChangeLanguage()"
              class="px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              style="background-color: var(--bg-color); border-color: var(--border-color); color: var(--text-color);"
              aria-label="{{ 'languages.label' | translate }}">
              <option value="en">{{ 'languages.en' | translate }}</option>
              <option value="nl">{{ 'languages.nl' | translate }}</option>
              <option value="srb">{{ 'languages.srb' | translate }}</option>
            </select>

            <!-- Theme Toggle -->
            <button
              (click)="toggleTheme()"
              class="p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
              [attr.aria-label]="'theme.toggle' | translate">
              @if (themeService.theme() === 'light') {
                <i class="fas fa-sun text-xl" style="color: var(--text-color);"></i>
              } @else if (themeService.theme() === 'dark') {
                <i class="fas fa-moon text-xl" style="color: var(--text-color);"></i>
              } @else {
                <i class="fas fa-circle-half-stroke text-xl" style="color: var(--text-color);"></i>
              }
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [],
})
export class HeaderComponent {
  private readonly _translateService = inject(TranslateService);
  readonly themeService = inject(ThemeService);

  currentLang: string = this._translateService.currentLang || 'en';

  onChangeLanguage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('language', this.currentLang);
    }
    this._translateService.use(this.currentLang);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
