import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, HostListener, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { onlyCompleteData } from 'apollo-angular';
import { BehaviorSubject, finalize, map, merge, Subject, switchMap, tap } from 'rxjs';
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

  private _calculating$ = new Subject<{ questionIds: string[]; selectedAnswerIds: string[] }>();
  private _reset$ = new BehaviorSubject<Score | undefined>(undefined);

  score$ = merge(
    this._calculating$.pipe(
      switchMap(({ questionIds, selectedAnswerIds }) =>
        this._questionsService.calculateScore(questionIds, selectedAnswerIds).pipe(
          tap((x) => this.scoreLoading.set(x.loading)),
          onlyCompleteData(),
          map((x) => x.data.calculateScore as Score),
          finalize(() => this.scoreLoading.set(false))
        )
      )
    ),
    this._reset$
  );

  scoreLoading = signal(false);

  // Track current language to trigger refetch when it changes
  private readonly _currentLang = toSignal(this._translateService.onLangChange);

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
    // Refetch questions when language changes
    effect(() => {
      if (this._currentLang()) {
        this._questionsService.refetch();
      }
    });
  }

  onCalculateScore(questionIds: string[], selectedAnswerIds: string[]): void {
    // Set loading state immediately to show sidebar
    this.scoreLoading.set(true);
    this._calculating$.next({ questionIds, selectedAnswerIds });
  }

  onRestart(): void {
    // Reset the score
    this._reset$.next(undefined);
    this.scoreLoading.set(false);
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
