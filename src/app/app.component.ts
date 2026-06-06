import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faBook,
  faDesktop,
  faGear,
  faHome,
  faMoon,
  faQuestionCircle,
  faRotate,
  faSun,
  faTrophy,
  faWifi,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { getLanguage } from './language';
import { LogoComponent } from './logo/logo.component';
import { ConnectivityService } from './services/connectivity.service';
import { OfflineDataService } from './services/offline-data.service';
import { PwaUpdateService } from './services/pwa-update.service';
import { SidebarService } from './services/sidebar.service';
import { ThemeService } from './services/theme.service';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { ElementHeightDirective } from './shared/directives/element-height.directive';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    TranslatePipe,
    RouterLink,
    RouterLinkActive,
    LogoComponent,
    FaIconComponent,
    LoadingSpinnerComponent,
    ElementHeightDirective,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly _translateService = inject(TranslateService);
  private readonly _document = inject(DOCUMENT);
  private readonly _themeService = inject(ThemeService);
  private readonly _titleService = inject(Title);
  private readonly _pwaUpdateService = inject(PwaUpdateService);
  protected readonly pwaUpdateService = this._pwaUpdateService;
  private readonly _connectivity = inject(ConnectivityService);
  protected readonly offlineData = inject(OfflineDataService);
  private readonly _destroyRef = inject(DestroyRef);

  // Constants
  private readonly LANGUAGES = ['en', 'nl', 'fr', 'srb'] as const;

  // FontAwesome icons - readonly for immutability
  protected readonly faHome = faHome;
  protected readonly faTrophy = faTrophy;
  protected readonly faBook = faBook;
  protected readonly faQuestionCircle = faQuestionCircle;
  protected readonly faSun = faSun;
  protected readonly faMoon = faMoon;
  protected readonly faDesktop = faDesktop;
  protected readonly faWifi = faWifi;
  protected readonly faRotate = faRotate;
  protected readonly faXmark = faXmark;
  protected readonly faGear = faGear;

  // State signals
  protected readonly currentLang = signal(getLanguage());
  protected readonly currentTheme = signal(this._themeService.currentTheme());
  protected readonly showLanguageMenu = signal(false);
  protected readonly offlineBannerDismissed = signal(false);
  protected readonly showThemeMenu = signal(false);
  protected readonly sidebar = inject(SidebarService);

  // Online/offline state - shared via ConnectivityService so other consumers
  // (e.g. quiz offline fallbacks) observe the same source.
  protected readonly isOnline = this._connectivity.isOnline;
  protected readonly isOfflineReady = computed(() => this.offlineData.lastSyncedAt() !== null);

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

    // Initialize PWA update checking with proper subscription cleanup
    this._pwaUpdateService.initializeUpdateCheck(this._destroyRef);
  }

  onChangeLanguage(lang: string): void {
    const localStorage = this._document.defaultView?.localStorage;
    localStorage?.setItem('language', lang);
    this._translateService.use(lang);
    this.currentLang.set(lang);
    document.documentElement.lang = lang;
  }

  toggleLanguageMenu(): void {
    this.showLanguageMenu.update((v) => !v);
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
    this.showThemeMenu.update((v) => !v);
  }

  selectTheme(theme: 'light' | 'dark' | 'system'): void {
    this._themeService.setTheme(theme);
    this.currentTheme.set(theme);
    this.showThemeMenu.set(false);
  }

  refreshOfflineData(): void {
    this.offlineData.refresh().pipe(takeUntilDestroyed(this._destroyRef)).subscribe();
  }
}
