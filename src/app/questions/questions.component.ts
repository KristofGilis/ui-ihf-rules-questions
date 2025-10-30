import { DOCUMENT } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { onlyCompleteData } from 'apollo-angular';
import { Observable, debounceTime, finalize, fromEvent, map, tap } from 'rxjs';
import { Question, Score } from '../../../graphql/generated';
import { QuestionsViewComponent } from './questions-view/questions-view.component';
import { QuestionsService } from './services/questions.service';
import { RandomStateService } from './services/random-state.service';

@Component({
  selector: 'app-questions',
  imports: [TranslatePipe, AsyncPipe, QuestionsViewComponent],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionsComponent {
  private readonly _questionsService = inject(QuestionsService);
  private readonly _randomStateService = inject(RandomStateService);
  private readonly _translateService = inject(TranslateService);
  private readonly _document = inject(DOCUMENT);

  random = this._randomStateService.random;
  loading = signal(false);
  questions$ = this._questionsService.questions$.pipe(
    tap((x) => this.loading.set(x.loading)),
    onlyCompleteData(),
    map((x) => {
      if (x.loading && this._randomStateService.random().isRandom) {
        return [];
      }
      return x.data.questions?.edges?.map((y) => y?.node as Question) ?? [];
    }),
    finalize(() => this.loading.set(false))
  );
  score$?: Observable<Score>;
  scoreLoading = signal(false);

  get hasMoreQuestions(): boolean {
    return this._questionsService.hasNextPage;
  }

  constructor() {
    effect(() => {
      this._questionsService.refetch();
    });

    // Use native scroll events instead of CDK
    if (typeof window !== 'undefined') {
      fromEvent(window, 'scroll')
        .pipe(debounceTime(100), takeUntilDestroyed())
        .subscribe(() => {
          const scrollHeight = this._document.documentElement.scrollHeight;
          const scrollTop = this._document.documentElement.scrollTop || this._document.body.scrollTop;
          const clientHeight = this._document.documentElement.clientHeight;

          if (scrollHeight - scrollTop - clientHeight < 50 && !this.loading()) {
            this._questionsService.fetchMore();
          }
        });
    }

    this._translateService.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => this._questionsService.refetch());
  }

  onCalculateScore(questionIds: string[], selectedAnswerIds: string[]): void {
    this.score$ = this._questionsService.calculateScore(questionIds, selectedAnswerIds).pipe(
      tap((x) => this.scoreLoading.set(x.loading)),
      onlyCompleteData(),
      map((x) => x.data.calculateScore as Score),
      finalize(() => this.scoreLoading.set(false))
    );
  }

  onNewRandomQuestions(): void {
    if (this._randomStateService.random().isRandom) {
      this._randomStateService.random.set({
        isRandom: true,
        count: this._randomStateService.random().count,
      });
      this.score$ = undefined;
    }
  }
}
