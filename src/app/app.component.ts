import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DOCUMENT, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
    TranslatePipe,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    LogoComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly _randomStateService = inject(RandomStateService);
  private readonly _translateService = inject(TranslateService);
  private readonly _document = inject(DOCUMENT);

  rootRoutes = routes.filter((x) => x.path);
  currentLang: string;

  constructor() {
    this._translateService.addLangs(['en', 'nl', 'srb']);
    this.currentLang = getLanguage();
    this._translateService.use(this.currentLang);
  }

  onNavigationLinkClicked(route?: string): void {
    if (route === 'questions') {
      this._randomStateService.random.set({ isRandom: false, count: 0 });
    }
  }

  onChangeLanguage(lang: string): void {
    const localStorage = this._document.defaultView?.localStorage;
    localStorage?.setItem('language', lang);
    this._translateService.use(lang);
  }
}
