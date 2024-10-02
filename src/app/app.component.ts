import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatNavList } from '@angular/material/list';
import {
  MatFormField,
  MatLabel,
  MatOption,
  MatSelect,
  MatSelectTrigger,
} from '@angular/material/select';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  TranslateModule,
  TranslatePipe,
  TranslateService,
} from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { routes } from './app.routes';
import { getLanguage } from './language';
import { RandomStateService } from './questions/services/random-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbar,
    MatIconButton,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    MatNavList,
    MatListItem,
    MatIcon,
    AsyncPipe,
    TranslateModule,
    RouterLink,
    RouterLinkActive,
    MatFormField,
    MatLabel,
    MatSelect,
    MatSelectTrigger,
    MatOption,
    FormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TranslatePipe],
})
export class AppComponent {
  private _randomStateService = inject(RandomStateService);
  private _breakpointObserver = inject(BreakpointObserver);
  private _translateService = inject(TranslateService);
  private _document = inject(DOCUMENT);
  private _apollo = inject(Apollo);

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

    this._translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(() => this._apollo.client.resetStore());
  }

  onNavigationLinkClicked(drawer: MatSidenav, route?: string): void {
    if (route === 'questions') {
      this._randomStateService.random.set({ isRandom: false, count: 0 });
    }
    if (this._isHandset) {
      drawer.close();
    }
  }

  onChangeLanguage(lang: string): void {
    const localStorage = this._document.defaultView?.localStorage;
    localStorage?.setItem('language', lang);
    this._translateService.use(lang);
  }
}
