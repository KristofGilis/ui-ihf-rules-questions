import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DOCUMENT, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatNavList } from '@angular/material/list';
import { MatFormField, MatLabel, MatOption, MatSelect, MatSelectTrigger } from '@angular/material/select';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { routes } from './app.routes';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { getLanguage } from './language';
import { LogoComponent } from './logo/logo.component';
import { RandomStateService } from './questions/services/random-state.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatIconButton,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    MatIcon,
    AsyncPipe,
    TranslatePipe,
    RouterLink,
    RouterLinkActive,
    MatFormField,
    MatSelect,
    MatOption,
    FormsModule,
    LogoComponent,
    ThemeToggleComponent,
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

  @ViewChild('drawer') drawer?: MatSidenav;

  private _isHandset = false;

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

  onNavigationLinkClicked(drawer: MatSidenav | null, route?: string): void {
    if (route === 'questions') {
      this._randomStateService.random.set({ isRandom: false, count: 0 });
    }
    if (this._isHandset && drawer) {
      drawer.close();
    }
  }

  onChangeLanguage(lang: string): void {
    const localStorage = this._document.defaultView?.localStorage;
    localStorage?.setItem('language', lang);
    this._translateService.use(lang);
  }
}
