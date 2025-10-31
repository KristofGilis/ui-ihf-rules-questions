import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { onlyCompleteData } from 'apollo-angular';
import { map, shareReplay } from 'rxjs';
import { GetVersionGQL } from '../../../graphql/generated';

@Component({
  selector: 'app-home',
  imports: [TranslatePipe, RouterLink, FormsModule, AsyncPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly _versionGQL = inject(GetVersionGQL);
  private readonly _translateService = inject(TranslateService);
  private readonly _router = inject(Router);

  questionCount = 10;
  timedMode = false;

  private readonly _query = this._versionGQL.watch();

  version$ = this._query.valueChanges.pipe(
    onlyCompleteData(),
    map((x) => x.data.version),
    shareReplay(1)
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
