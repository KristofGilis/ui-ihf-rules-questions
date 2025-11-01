import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { onlyCompleteData } from 'apollo-angular';
import { BehaviorSubject, finalize, map, Observable, tap } from 'rxjs';
import { Question, Score } from '../../../graphql/generated';
import { PageContainerComponent, PageHeroComponent } from '../shared/components';
import { ScoreOverviewComponent } from './questions-view/components/score-overview/score-overview.component';
import { QuestionsViewComponent } from './questions-view/questions-view.component';
import { QuestionsService } from './services/questions.service';

@Component({
  selector: 'app-questions',
  imports: [
    TranslatePipe,
    AsyncPipe,
    QuestionsViewComponent,
    PageContainerComponent,
    PageHeroComponent,
    ScoreOverviewComponent,
  ],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionsComponent {
  private readonly _questionsService = inject(QuestionsService);
  private readonly _translateService = inject(TranslateService);

  loading = signal(false);
  questions$ = this._questionsService.questions$.pipe(
    tap((x) => this.loading.set(x.loading)),
    onlyCompleteData(),
    map((x) => x.data.questions?.edges?.map((y) => y?.node as Question) ?? []),
    finalize(() => this.loading.set(false))
  );
  score$?: Observable<Score>;
  scoreLoading = signal(false);
  private _scoreSubject = new BehaviorSubject<Score | undefined>(undefined);

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
    const startTime = Date.now();
    const minLoadingTime = 300; // Minimum 300ms to show spinner

    // Set loading state to true at the start
    this.scoreLoading.set(true);

    // Set score$ to the BehaviorSubject observable so layout doesn't flash
    if (!this.score$) {
      this.score$ = this._scoreSubject.asObservable() as Observable<Score>;
    }

    this._questionsService
      .calculateScore(questionIds, selectedAnswerIds)
      .pipe(
        onlyCompleteData(),
        map((x) => x.data.calculateScore as Score)
      )
      .subscribe((score) => {
        // Calculate remaining time for minimum spinner visibility
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minLoadingTime - elapsed);

        setTimeout(() => {
          // Update both together
          this._scoreSubject.next(score);
          this.scoreLoading.set(false);
        }, remaining);
      });
  }

  onScrollToQuestion(questionId: string): void {
    // Find the question element and scroll to it
    const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
    if (questionElement) {
      questionElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }
}
