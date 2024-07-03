import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, finalize, map, tap } from 'rxjs';
import { Question, Score } from '../../../graphql/generated';
import { QuestionsViewComponent } from './questions-view/questions-view.component';
import { QuestionsService } from './services/questions.service';
import { RandomStateService } from './services/random-state.service';

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [TranslateModule, AsyncPipe, QuestionsViewComponent],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionsComponent {
  private _questionsService = inject(QuestionsService);
  private _scrollDispatcher = inject(ScrollDispatcher);
  private _randomStateService = inject(RandomStateService);

  random = this._randomStateService.random;
  loading = false;
  questions$ = this._questionsService.questions$.pipe(
    tap((x) => (this.loading = x.loading)),
    map((x) => {
      if (x.loading && this._randomStateService.random().isRandom) {
        return [];
      }
      return x.data?.questions?.edges?.map((y) => y.node as Question) ?? [];
    }),
    finalize(() => (this.loading = false))
  );
  score$?: Observable<Score>;
  scoreLoading = false;

  get hasMoreQuestions(): boolean {
    return this._questionsService.hasNextPage;
  }

  constructor() {
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
    this.score$ = this._questionsService
      .calculateScore(questionIds, selectedAnswerIds)
      .pipe(
        tap((x) => (this.scoreLoading = x.loading)),
        map((x) => x.data?.calculateScore as Score),
        finalize(() => (this.scoreLoading = false))
      );
  }

  onNewRandomQuestions(): void {
    if (this._randomStateService.random().isRandom) {
      this._randomStateService.random.set({
        isRandom: true,
        count: this._randomStateService.random().count,
      });
    }
  }
}
