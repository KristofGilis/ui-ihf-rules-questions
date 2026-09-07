import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { onlyCompleteData } from 'apollo-angular';
import { BehaviorSubject, Subject, finalize, map, merge, shareReplay, switchMap, tap } from 'rxjs';
import { Question, Rule, Score } from '../../../graphql/types';
import { parseTranslations } from '../quiz/pipes/parse-translations.function';
import { ScoreOverviewComponent } from '../questions/questions-view/components/score-overview/score-overview.component';
import { QuestionsViewComponent } from '../questions/questions-view/questions-view.component';
import { QuestionsService } from '../questions/services/questions.service';
import { CurrentLanguageService } from '../services/current-language.service';
import { PageContainerComponent, PageHeroComponent } from '../shared/components';
import { RuleService } from './services/rule.service';

@Component({
  selector: 'app-rule',
  imports: [
    AsyncPipe,
    TranslatePipe,
    QuestionsViewComponent,
    ScoreOverviewComponent,
    PageContainerComponent,
    PageHeroComponent,
  ],
  templateUrl: './rule.component.html',
  styleUrl: './rule.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _ruleService = inject(RuleService);
  private readonly _questionsService = inject(QuestionsService);
  readonly currentLanguage = inject(CurrentLanguageService).current;

  readonly loading = signal(false);
  readonly scoreLoading = signal(false);

  readonly rule$ = this._ruleService.get(this._activatedRoute.snapshot.params['id']).pipe(
    tap((x) => this.loading.set(x.loading)),
    onlyCompleteData(),
    map((x) => x.data.ruleById as Rule),
    finalize(() => this.loading.set(false)),
    shareReplay()
  );

  private readonly _calculating$ = new Subject<{ questionIds: string[]; selectedAnswerIds: string[] }>();
  private readonly _reset$ = new BehaviorSubject<Score | undefined>(undefined);

  readonly score$ = merge(
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

  get hasMoreQuestions(): boolean {
    return this._ruleService.hasNextPage;
  }

  // Mobile keyboard close/open resizes the viewport and fires scroll events; without this guard that
  // spuriously triggers fetchMore() and makes it look like the results changed.
  private _lastInnerHeight = window.innerHeight;

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.loading()) {
      return;
    }

    if (window.innerHeight !== this._lastInnerHeight) {
      this._lastInnerHeight = window.innerHeight;
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const threshold = 200; // pixels from bottom

    if (scrollPosition >= documentHeight - threshold && this.hasMoreQuestions) {
      this._ruleService.fetchMoreQuestions();
    }
  }

  constructor() {
    // No refetch on language change: rule/question/answer translations are
    // stored in a `translations` field on each entity and rendered reactively
    // via `PhraseTranslationPipe` + `currentLanguage()`.
  }

  getQuestions(rule: Rule | null): Question[] {
    return rule?.questions?.edges?.filter((x) => x !== null).map((x) => x.node as Question) ?? [];
  }

  getRuleName(rule: Rule | null): string | undefined {
    if (!rule) return undefined;
    const translated = parseTranslations(rule.translations as string | Record<string, string> | null | undefined)[
      this.currentLanguage()
    ];
    return `${rule.number} - ${translated ?? rule.name ?? ''}`;
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
