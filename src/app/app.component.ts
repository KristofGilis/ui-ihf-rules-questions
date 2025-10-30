import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DOCUMENT, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBars, faHome, faBook, faQuestionCircle, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { routes } from './app.routes';
import { getLanguage } from './language';
import { LogoComponent } from './logo/logo.component';
import { RandomStateService } from './questions/services/random-state.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    FormsModule,
    LogoComponent,
    FaIconComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly _randomStateService = inject(RandomStateService);
  private readonly _translateService = inject(TranslateService);
  private readonly _document = inject(DOCUMENT);

  // Icons
  faBars = faBars;
  faHome = faHome;
  faBook = faBook;
  faQuestionCircle = faQuestionCircle;
  faMoon = faMoon;
  faSun = faSun;

  // State
  mobileMenuOpen = signal(false);
  isDarkMode = signal(false);
  rootRoutes = routes.filter((x) => x.path);
  currentLang: string;

  constructor() {
    this._translateService.addLangs(['en', 'nl', 'srb']);

    this.currentLang = getLanguage();

    this._translateService.use(this.currentLang);

    // Check system preference and localStorage for theme
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const localStorage = this._document.defaultView?.localStorage;
    const savedTheme = localStorage?.getItem('theme');
    
    if (savedTheme === 'dark') {
      this.isDarkMode.set(true);
      this._document.documentElement.classList.add('theme-dark');
    } else if (savedTheme === 'light') {
      this.isDarkMode.set(false);
      this._document.documentElement.classList.add('theme-light');
    } else {
      // Follow system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode.set(prefersDark);
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  toggleTheme(): void {
    const localStorage = this._document.defaultView?.localStorage;
    this.isDarkMode.update(value => !value);
    
    // Remove both classes first
    this._document.documentElement.classList.remove('theme-dark', 'theme-light');
    
    // Add the appropriate class
    if (this.isDarkMode()) {
      this._document.documentElement.classList.add('theme-dark');
      localStorage?.setItem('theme', 'dark');
    } else {
      this._document.documentElement.classList.add('theme-light');
      localStorage?.setItem('theme', 'light');
    }
  }

  onNavigationLinkClicked(route?: string): void {
    if (route === 'questions') {
      this._randomStateService.random.set({ isRandom: false, count: 0 });
    }
    this.mobileMenuOpen.set(false);
  }

  onChangeLanguage(lang: string): void {
    const localStorage = this._document.defaultView?.localStorage;
    localStorage?.setItem('language', lang);
    this._translateService.use(lang);
    this.currentLang = lang;
  }

  getIconForRoute(routePath?: string) {
    switch(routePath) {
      case 'home': return this.faHome;
      case 'rules': return this.faBook;
      case 'questions': return this.faQuestionCircle;
      default: return this.faHome;
    }
  }
}
