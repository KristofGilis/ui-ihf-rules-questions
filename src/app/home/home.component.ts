import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { onlyCompleteData } from 'apollo-angular';
import { map, shareReplay } from 'rxjs';
import { GetVersionGQL } from '../../../graphql/generated';
import { RandomStateService } from '../questions/services/random-state.service';
import { QuizService } from '../services/quiz.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslatePipe, RouterLink, FormsModule, AsyncPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly _versionGQL = inject(GetVersionGQL);
  private readonly _translateService = inject(TranslateService);

  randomStateService = inject(RandomStateService);
  quizService = inject(QuizService);
  questionCount = 10;

  onQuestionCountChange(count: number): void {
    this.quizService.config.update((c) => ({ ...c, questionCount: count }));
  }

  onTimedModeToggle(): void {
    this.quizService.config.update((c) => ({ ...c, timedMode: !c.timedMode }));
  }

  private readonly _query = this._versionGQL.watch();

  version$ = this._query.valueChanges.pipe(
    onlyCompleteData(),
    map((x) => x.data.version),
    shareReplay(1)
  );

  constructor() {
    this._translateService.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => this._query.refetch());
  }
}
