import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DOCUMENT, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { routes } from './app.routes';
import { getLanguage } from './language';
import { LogoComponent } from './logo/logo.component';
import { RandomStateService } from './questions/services/random-state.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AsyncPipe,
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
  private readonly _breakpointObserver = inject(BreakpointObserver);
  private readonly _translateService = inject(TranslateService);
  private readonly _document = inject(DOCUMENT);
  
  readonly themeService = inject(ThemeService);

  private _isHandset = false;
  mobileMenuOpen = false;

  isHandset$: Observable<boolean> = this._breakpointObserver
    .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
    .pipe(
      map((result) => result.matches),
      tap((result) => (this._isHandset = result)),
      shareReplay()
    );

  rootRoutes = routes.filter((x) => x.path);
  currentLang: string;

  constructor() {
    this._translateService.addLangs(['en', 'nl', 'srb']);

    this.currentLang = getLanguage();

    this._translateService.use(this.currentLang);
  }

  onNavigationLinkClicked(drawer: any | null, route?: string): void {
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
