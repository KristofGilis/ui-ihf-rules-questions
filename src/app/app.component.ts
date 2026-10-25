import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Capacitor } from '@capacitor/core';
import { NativeNavigation } from '@capgo/capacitor-native-navigation';
import type { NativeNavigationIcon } from '@capgo/capacitor-native-navigation';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faHouse as faHouseRegular,
  faCircleQuestion as faQuestionCircleRegular,
} from '@fortawesome/free-regular-svg-icons';
import {
  faBook,
  faDesktop,
  faGear,
  faHome,
  faMagnifyingGlass,
  faMoon,
  faQuestionCircle,
  faRotate,
  faSun,
  faTrophy,
  faWifi,
  faXmark,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { filter, startWith } from 'rxjs';
import { getLanguage } from './language';
import { LogoComponent } from './logo/logo.component';
import { ConnectivityService } from './services/connectivity.service';
import { OfflineDataService } from './services/offline-data.service';
import { PwaUpdateService } from './services/pwa-update.service';
import { SidebarService } from './services/sidebar.service';
import { ThemeService } from './services/theme.service';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { ElementHeightDirective } from './shared/directives/element-height.directive';

interface TabBarItem {
  readonly route: string;
  readonly exact?: boolean;
  readonly labelKey: string;
  readonly solidIcon: IconDefinition;
  readonly regularIcon?: IconDefinition;
}

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
  private readonly _router = inject(Router);
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
  protected readonly faHouseRegular = faHouseRegular;
  protected readonly faTrophy = faTrophy;
  protected readonly faQuestionCircle = faQuestionCircle;
  protected readonly faQuestionCircleRegular = faQuestionCircleRegular;
  protected readonly faBook = faBook;
  protected readonly faMagnifyingGlass = faMagnifyingGlass;
  protected readonly faSun = faSun;
  protected readonly faMoon = faMoon;
  protected readonly faDesktop = faDesktop;
  protected readonly faWifi = faWifi;
  protected readonly faRotate = faRotate;
  protected readonly faXmark = faXmark;
  protected readonly faGear = faGear;
  protected readonly isNativeApp = Capacitor.isNativePlatform();
  protected readonly nativeTabbarReady = signal(false);

  // Mobile tabbar items
  protected readonly tabItems: readonly TabBarItem[] = [
    {
      route: '/home',
      exact: true,
      labelKey: 'navigation.home',
      solidIcon: this.faHome,
      regularIcon: this.faHouseRegular,
    },
    { route: '/quiz', labelKey: 'navigation.quiz', solidIcon: this.faTrophy },
    {
      route: '/questions',
      labelKey: 'navigation.questions',
      solidIcon: this.faQuestionCircle,
      regularIcon: this.faQuestionCircleRegular,
    },
    {
      route: '/rules',
      labelKey: 'navigation.rules',
      solidIcon: this.faBook,
    },
    {
      route: '/search',
      labelKey: 'navigation.search',
      solidIcon: this.faMagnifyingGlass,
    },
  ];

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
      void this.updateNativeTabbar();
    });

    if (this.isNativeApp) {
      this._router.events
        .pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd),
          startWith(null),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe(() => void this.updateNativeTabbar());

      void this.initializeNativeTabbar();
    }

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

  private async initializeNativeTabbar(): Promise<void> {
    try {
      await NativeNavigation.configure({
        contentInsetMode: 'css',
        platformStyle: 'auto',
        colors: { dynamic: true },
      });

      await NativeNavigation.addListener('tabSelect', ({ id }) => {
        const selectedTab = this.tabItems.find((tab) => tab.route.slice(1) === id);
        if (selectedTab) {
          void this._router.navigateByUrl(selectedTab.route);
        }
      });

      await this.updateNativeTabbar(true);
      this.nativeTabbarReady.set(true);
    } catch (error) {
      // Keep the web tab bar as a usable fallback if native setup fails.
      console.error('Could not initialize the native tab bar', error);
    }
  }

  private async updateNativeTabbar(force = false): Promise<void> {
    if (!this.isNativeApp || (!force && !this.nativeTabbarReady())) {
      return;
    }

    const tabs = this.tabItems.map((tab) => ({
      id: tab.route.slice(1),
      title: this._translateService.instant(tab.labelKey),
      icon: this.toNativeIcon(tab.regularIcon ?? tab.solidIcon),
      selectedIcon: this.toNativeIcon(tab.solidIcon),
    }));

    try {
      await NativeNavigation.setTabbar({
        tabs,
        selectedId: this.selectedTabId(),
        labels: true,
        icons: true,
        style: { placement: 'auto' },
        colors: { dynamic: true },
      });
    } catch (error) {
      console.error('Could not update the native tab bar', error);
    }
  }

  private selectedTabId(): string | undefined {
    const currentPath = this._router.url.split(/[?#]/, 1)[0];
    const activeTab = [...this.tabItems]
      .sort((first, second) => second.route.length - first.route.length)
      .find((tab) => currentPath === tab.route || (!tab.exact && currentPath.startsWith(`${tab.route}/`)));

    return activeTab?.route.slice(1);
  }

  private toNativeIcon(definition: IconDefinition): NativeNavigationIcon {
    const [width, height, , , rawPathData] = definition.icon;
    const paths = Array.isArray(rawPathData) ? rawPathData : [rawPathData];
    const pathElements = paths.map((path) => `<path d="${path}"/>`).join('');

    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${pathElements}</svg>`,
      width: 24,
      height: 24,
      template: true,
    };
  }
}
