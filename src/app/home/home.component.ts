import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { onlyCompleteData } from 'apollo-angular';
import { finalize, map, shareReplay, tap } from 'rxjs';
import { GetVersionGQL } from '../../../graphql/generated';
import packageJson from '../../../package.json';
import { environment } from '../../environments/environment';
import { LogoComponent } from '../logo/logo.component';
import { PageContainerComponent, PageHeroComponent, QuizConfigCardComponent } from '../shared/components';

@Component({
  selector: 'app-home',
  imports: [
    AsyncPipe,
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
  private readonly _versionGQL = inject(GetVersionGQL);
  private readonly _translateService = inject(TranslateService);
  private readonly _router = inject(Router);

  loadingVersion = signal(false);

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
  readonly appVersion = packageJson.version;

  private readonly _query = this._versionGQL.watch();

  version$ = this._query.valueChanges.pipe(
    tap((x) => this.loadingVersion.set(x.loading)),
    onlyCompleteData(),
    map((x) => x.data.version),
    shareReplay(1),
    finalize(() => this.loadingVersion.set(false))
  );

  constructor() {
    this._translateService.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => this._query.refetch());
  }

  onStartQuiz(config: { questionCount: number; timedMode: boolean }): void {
    this._router.navigate(['/quiz/view'], {
      state: {
        count: config.questionCount,
        timed: config.timedMode,
      },
    });
  }
}
