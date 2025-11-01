import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { onlyCompleteData } from 'apollo-angular';
import { finalize, map, shareReplay, tap } from 'rxjs';
import { GetVersionGQL } from '../../../graphql/generated';
import { LogoComponent } from '../logo/logo.component';
import { LoadingSpinnerComponent, PageHeroComponent } from '../shared/components';

@Component({
  selector: 'app-home',
  imports: [
    AsyncPipe,
    FormsModule,
    RouterLink,
    TranslatePipe,
    LogoComponent,
    LoadingSpinnerComponent,
    PageHeroComponent,
  ],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly _versionGQL = inject(GetVersionGQL);
  private readonly _translateService = inject(TranslateService);
  private readonly _router = inject(Router);

  questionCount = 10;
  timedMode = false;
  loadingVersion = signal(false);

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

  startQuiz(): void {
    this._router.navigate(['/quiz'], {
      queryParams: {
        count: this.questionCount,
        timed: this.timedMode,
      },
    });
  }
}
