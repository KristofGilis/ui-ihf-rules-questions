import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable, finalize, map, tap } from 'rxjs';
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
  private readonly _scrollDispatcher = inject(ScrollDispatcher);
  private readonly _randomStateService = inject(RandomStateService);

  random = this._randomStateService.random;
  loading = signal(false);
  questions$ = this._questionsService.questions$.pipe(
    tap((x) => this.loading.set(x.loading)),
    map((x) => {
      if (x.loading && this._randomStateService.random().isRandom) {
        return [];
      }
      return x.data?.questions?.edges?.map((y) => y.node as Question) ?? [];
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

    this._scrollDispatcher
      .scrolled()
      .pipe(takeUntilDestroyed())
      .subscribe((res) => {
        if ((res as CdkScrollable).measureScrollOffset('bottom') < 50) {
          this._questionsService.fetchMore();
        }
      });
  }

  onCalculateScore(questionIds: string[], selectedAnswerIds: string[]): void {
    this.score$ = this._questionsService.calculateScore(questionIds, selectedAnswerIds).pipe(
      tap((x) => this.scoreLoading.set(x.loading)),
      map((x) => x.data?.calculateScore as Score),
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
