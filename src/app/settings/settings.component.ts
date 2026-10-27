import { DatePipe, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowRightArrowLeft,
  faCheckCircle,
  faDesktop,
  faExclamationTriangle,
  faGear,
  faGlobe,
  faMoon,
  faPaintBrush,
  faRotate,
  faSun,
  faTableColumns,
  faWifi,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConnectivityService } from '../services/connectivity.service';
import { CurrentLanguageService } from '../services/current-language.service';
import { OfflineDataService } from '../services/offline-data.service';
import { SidebarService } from '../services/sidebar.service';
import { ThemeService, type Theme } from '../services/theme.service';
import { PageContainerComponent } from '../shared/components/page-container/page-container.component';
import { PageHeroComponent } from '../shared/components/page-hero/page-hero.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, FaIconComponent, PageContainerComponent, PageHeroComponent, DatePipe],
})
export class SettingsComponent {
  private readonly _translateService = inject(TranslateService);
  private readonly _themeService = inject(ThemeService);
  private readonly _document = inject(DOCUMENT);
  private readonly _destroyRef = inject(DestroyRef);

  protected readonly offlineData = inject(OfflineDataService);
  protected readonly isOnline = inject(ConnectivityService).isOnline;
  protected readonly sidebar = inject(SidebarService);

  // Icons
  protected readonly faGear = faGear;
  protected readonly faGlobe = faGlobe;
  protected readonly faPaintBrush = faPaintBrush;
  protected readonly faWifi = faWifi;
  protected readonly faTableColumns = faTableColumns;
  protected readonly faSun = faSun;
  protected readonly faMoon = faMoon;
  protected readonly faDesktop = faDesktop;
  protected readonly faRotate = faRotate;
  protected readonly faCheckCircle = faCheckCircle;
  protected readonly faExclamationTriangle = faExclamationTriangle;
  protected readonly faArrowRightArrowLeft = faArrowRightArrowLeft;

  // Language
  protected readonly currentLang = inject(CurrentLanguageService).current;
  readonly languages = [
    { code: 'en', key: 'languages.en' },
    { code: 'nl', key: 'languages.nl' },
    { code: 'fr', key: 'languages.fr' },
    { code: 'srb', key: 'languages.srb' },
  ] as const;

  // Theme
  protected readonly currentTheme = computed(() => this._themeService.currentTheme());
  readonly themes: { value: Theme; labelKey: string; icon: typeof faSun }[] = [
    { value: 'light', labelKey: 'theme.light', icon: faSun },
    { value: 'dark', labelKey: 'theme.dark', icon: faMoon },
    { value: 'system', labelKey: 'theme.system', icon: faDesktop },
  ];

  // Offline
  protected readonly isOfflineReady = computed(() => this.offlineData.lastSyncedAt() !== null);

  selectLanguage(lang: string): void {
    this._document.defaultView?.localStorage?.setItem('language', lang);
    this._translateService.use(lang);
    if (this._document.documentElement) {
      this._document.documentElement.lang = lang;
    }
  }

  selectTheme(theme: Theme): void {
    this._themeService.setTheme(theme);
  }

  syncNow(): void {
    this.offlineData.refresh().pipe(takeUntilDestroyed(this._destroyRef)).subscribe();
  }

  readonly activeOptionClass =
    'cursor-pointer border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300';
  readonly inactiveOptionClass =
    'cursor-pointer border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800';
}
