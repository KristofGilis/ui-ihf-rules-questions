import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ActionSheet } from '@capacitor/action-sheet';
import { Capacitor } from '@capacitor/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faBook,
  faDesktop,
  faHome,
  faMoon,
  faQuestionCircle,
  faSun,
  faTrophy,
  faWifi,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { fromEvent, map, merge, of } from 'rxjs';
import { getLanguage } from './language';
import { LogoComponent } from './logo/logo.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslatePipe, RouterLink, RouterLinkActive, LogoComponent, FaIconComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly _translateService = inject(TranslateService);
  private readonly _document = inject(DOCUMENT);
  private readonly _themeService = inject(ThemeService);
  private readonly _titleService = inject(Title);

  // Constants
  private readonly LANGUAGES = ['en', 'nl', 'srb'] as const;

  // FontAwesome icons - readonly for immutability
  protected readonly faHome = faHome;
  protected readonly faTrophy = faTrophy;
  protected readonly faBook = faBook;
  protected readonly faQuestionCircle = faQuestionCircle;
  protected readonly faSun = faSun;
  protected readonly faMoon = faMoon;
  protected readonly faDesktop = faDesktop;
  protected readonly faWifi = faWifi;

  // State signals
  protected readonly currentLang = signal(getLanguage());
  protected readonly currentTheme = signal(this._themeService.currentTheme());
  protected readonly showLanguageMenu = signal(false);
  protected readonly showThemeMenu = signal(false);
  protected readonly isNativePlatform = Capacitor.isNativePlatform();

  // Online/offline state
  protected readonly isOnline = toSignal(
    merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ),
    { initialValue: navigator.onLine }
  );

  // Computed signals for theme icon and label
  protected readonly themeIcon = computed(() => {
    const theme = this.currentTheme();
    if (theme === 'light') return this.faSun;
    if (theme === 'dark') return this.faMoon;
    return this.faDesktop;
  });

  protected readonly themeLabel = computed(() => {
    const theme = this.currentTheme();
    if (theme === 'light') return 'theme.light';
    if (theme === 'dark') return 'theme.dark';
    return 'theme.system';
  });

  constructor() {
    this._translateService.addLangs([...this.LANGUAGES]);
    this._translateService.use(this.currentLang());

    this._translateService.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => {
      // Update document title on language change
      this._titleService.setTitle(this._translateService.instant('main.title'));
    });
  }

  onChangeLanguage(lang: string): void {
    const localStorage = this._document.defaultView?.localStorage;
    localStorage?.setItem('language', lang);
    this._translateService.use(lang);
    this.currentLang.set(lang);
    document.documentElement.lang = lang;
  }

  toggleLanguageMenu(): void {
    if (this.isNativePlatform) {
      this.showLanguageActionSheet();
    } else {
      this.showLanguageMenu.update((v) => !v);
    }
  }

  private async showLanguageActionSheet(): Promise<void> {
    const result = await ActionSheet.showActions({
      title: this._translateService.instant('languages.label'),
      options: [
        { title: this._translateService.instant('languages.en') },
        { title: this._translateService.instant('languages.nl') },
        { title: this._translateService.instant('languages.srb') },
      ],
    });

    if (result.index >= 0 && result.index < this.LANGUAGES.length) {
      this.onChangeLanguage(this.LANGUAGES[result.index]);
    }
  }

  selectLanguage(lang: string): void {
    this.onChangeLanguage(lang);
    this.showLanguageMenu.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const languageButton = target.closest('.language-dropdown');
    const themeButton = target.closest('.theme-dropdown');

    if (!languageButton && this.showLanguageMenu()) {
      this.showLanguageMenu.set(false);
    }

    if (!themeButton && this.showThemeMenu()) {
      this.showThemeMenu.set(false);
    }
  }

  toggleThemeMenu(): void {
    if (this.isNativePlatform) {
      this.showThemeActionSheet();
    } else {
      this.showThemeMenu.update((v) => !v);
    }
  }

  private async showThemeActionSheet(): Promise<void> {
    const result = await ActionSheet.showActions({
      title: this._translateService.instant('theme.toggle'),
      options: [
        { title: this._translateService.instant('theme.light') },
        { title: this._translateService.instant('theme.dark') },
        { title: this._translateService.instant('theme.system') },
      ],
    });

    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    if (result.index >= 0 && result.index < themes.length) {
      const selectedTheme = themes[result.index];
      this._themeService.setTheme(selectedTheme);
      this.currentTheme.set(selectedTheme);
    }
  }

  selectTheme(theme: 'light' | 'dark' | 'system'): void {
    this._themeService.setTheme(theme);
    this.currentTheme.set(theme);
    this.showThemeMenu.set(false);
  }
}
