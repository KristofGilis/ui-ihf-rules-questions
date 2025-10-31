import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBook,
  faDesktop,
  faHome,
  faMoon,
  faQuestionCircle,
  faSun,
  faTrophy,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { routes } from './app.routes';
import { getLanguage } from './language';
import { LogoComponent } from './logo/logo.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslatePipe, RouterLink, RouterLinkActive, FormsModule, LogoComponent, FontAwesomeModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly _translateService = inject(TranslateService);
  private readonly _document = inject(DOCUMENT);
  readonly themeService = inject(ThemeService);

  // FontAwesome icons
  faHome = faHome;
  faTrophy = faTrophy;
  faBook = faBook;
  faQuestionCircle = faQuestionCircle;
  faSun = faSun;
  faMoon = faMoon;
  faDesktop = faDesktop;

  rootRoutes = routes.filter((x) => x.path);
  currentLang: string;

  constructor() {
    this._translateService.addLangs(['en', 'nl', 'srb']);

    this.currentLang = getLanguage();

    this._translateService.use(this.currentLang);
  }

  onChangeLanguage(lang: string): void {
    const localStorage = this._document.defaultView?.localStorage;
    localStorage?.setItem('language', lang);
    this._translateService.use(lang);
    this.currentLang = lang;
  }

  getThemeIcon() {
    const theme = this.themeService.currentTheme();
    if (theme === 'light') return this.faSun;
    if (theme === 'dark') return this.faMoon;
    return this.faDesktop;
  }
}
