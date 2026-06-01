import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import {
  faChevronRight,
  faExternalLinkAlt,
  faFileAlt,
  faQuestionCircle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { catchError, defer, finalize, map, of, shareReplay, startWith, switchMap, tap } from 'rxjs';
import { PrefetchVersionsGQL } from '../../../graphql/generated';
import { environment } from '../../environments/environment';
import { LogoComponent } from '../logo/logo.component';
import { PageContainerComponent, PageHeroComponent, QuizConfigCardComponent } from '../shared/components';
import { APP_VERSION } from '../../version';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    TranslatePipe,
    LogoComponent,
    PageContainerComponent,
    PageHeroComponent,
    QuizConfigCardComponent,
    FaIconComponent,
  ],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly _prefetchVersionsGQL = inject(PrefetchVersionsGQL);
  private readonly _translateService = inject(TranslateService);
  private readonly _router = inject(Router);

  readonly loadingVersion = signal(false);

  // Environment configuration
  readonly githubUrl = environment.githubUrl;

  // Font Awesome icons
  readonly faFileAlt = faFileAlt;
  readonly faChevronRight = faChevronRight;
  readonly faQuestionCircle = faQuestionCircle;
  readonly faGithub = faGithub;
  readonly faExternalLinkAlt = faExternalLinkAlt;
  readonly faSpinner = faSpinner;

  readonly currentYear = new Date().getFullYear();
  readonly appVersion = APP_VERSION;

  // Re-resolve the version whenever the active language changes. `startWith`
  // also fires once for the initial language.
  private readonly _lang$ = this._translateService.onLangChange.pipe(
    map((e) => e.lang),
    startWith(this._translateService.getCurrentLang() ?? this._translateService.getFallbackLang() ?? 'en')
  );

  readonly version = toSignal(
    this._lang$.pipe(
      switchMap((lang) =>
        defer(() => {
          this.loadingVersion.set(true);
          // The server's `versions` scalar is a per-language map populated by
          // OfflineDataService at startup and on every cache refresh. We use
          // it as the single source of truth so the value is language-aware
          // both online and offline. The legacy `getVersion` scalar is not
          // parameterised by language and always returns "en", so we ignore
          // it here.
          return this._prefetchVersionsGQL.fetch({ fetchPolicy: 'cache-first' }).pipe(
            map((r) => {
              const versions = r.data?.versions as Record<string, string> | null | undefined;
              return versions?.[lang] ?? versions?.['en'] ?? undefined;
            }),
            catchError(() => of<string | undefined>(undefined))
          );
        }).pipe(
          tap(() => this.loadingVersion.set(false)),
          finalize(() => this.loadingVersion.set(false))
        )
      ),
      shareReplay(1)
    )
  );

  onStartQuiz(config: { questionCount: number; timedMode: boolean }): void {
    this._router.navigate(['/quiz/view'], {
      state: {
        count: config.questionCount,
        timed: config.timedMode,
      },
    });
  }
}
