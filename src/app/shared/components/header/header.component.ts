import { Component, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSun, faMoon, faCircleHalfStroke } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../services/theme.service';
import { DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FontAwesomeModule, TranslatePipe, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly _themeService = inject(ThemeService);
  private readonly _translateService = inject(TranslateService);
  private readonly _document = inject(DOCUMENT);

  readonly faSun = faSun;
  readonly faMoon = faMoon;
  readonly faCircleHalfStroke = faCircleHalfStroke;

  themeMode = this._themeService.themeMode;
  currentLang = this._translateService.currentLang || 'en';

  get themeIcon() {
    const mode = this.themeMode();
    return mode === 'light' ? this.faSun : mode === 'dark' ? this.faMoon : this.faCircleHalfStroke;
  }

  onToggleTheme(): void {
    this._themeService.toggleTheme();
  }

  onChangeLanguage(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value;
    const localStorage = this._document.defaultView?.localStorage;
    localStorage?.setItem('language', lang);
    this._translateService.use(lang);
    this.currentLang = lang;
  }
}
