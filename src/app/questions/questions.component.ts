import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { onlyCompleteData } from 'apollo-angular';
import { finalize, map, Observable, tap } from 'rxjs';
import { Question, Score } from '../../../graphql/generated';
import { PageContainerComponent, PageHeroComponent } from '../shared/components';
import { QuestionsViewComponent } from './questions-view/questions-view.component';
import { QuestionsService } from './services/questions.service';
import { RandomStateService } from './services/random-state.service';

@Component({
  selector: 'app-questions',
  imports: [TranslatePipe, AsyncPipe, QuestionsViewComponent, PageContainerComponent, PageHeroComponent],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionsComponent {
  private readonly _questionsService = inject(QuestionsService);
  private readonly _randomStateService = inject(RandomStateService);
  private readonly _translateService = inject(TranslateService);

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

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (this.loading()) {
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const threshold = 200; // pixels from bottom

    if (scrollPosition >= documentHeight - threshold && this.hasMoreQuestions) {
      this._questionsService.fetchMore();
    }
  }

  constructor() {
    effect(() => {
      this._questionsService.refetch();
    });

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
