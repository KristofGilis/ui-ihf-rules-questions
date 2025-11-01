import { AsyncPipe, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { onlyCompleteData } from 'apollo-angular';
import { Observable, finalize, map, shareReplay, tap } from 'rxjs';
import { Question, Rule, Score } from '../../../graphql/generated';
import { ScoreOverviewComponent } from '../questions/questions-view/components/score-overview/score-overview.component';
import { QuestionsViewComponent } from '../questions/questions-view/questions-view.component';
import { QuestionsService } from '../questions/services/questions.service';
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
  private readonly _translateService = inject(TranslateService);
  private readonly _document = inject(DOCUMENT);

  loading = signal(false);
  score$?: Observable<Score>;
  scoreLoading = signal(false);

  rule$ = this._ruleService.get(this._activatedRoute.snapshot.params['id']).pipe(
    tap((x) => this.loading.set(x.loading)),
    onlyCompleteData(),
    map((x) => x.data.ruleById as Rule),
    finalize(() => this.loading.set(false)),
    shareReplay()
  );

  get hasMoreQuestions(): boolean {
    return this._ruleService.hasNextPage;
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
      this._ruleService.fetchMoreQuestions();
    }
  }

  constructor() {
    this._translateService.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => this._ruleService.refetch());
  }

  getQuestions(rule: Rule | null): Question[] {
    return rule?.questions?.edges?.map((x) => x.node as Question) ?? [];
  }

  getRuleName(rule: Rule | null): string | undefined {
    if (rule) {
      return `${rule.number} - ${rule.name}`;
    }

    return undefined;
  }

  onCalculateScore(questionIds: string[], selectedAnswerIds: string[]): void {
    this.score$ = this._questionsService.calculateScore(questionIds, selectedAnswerIds).pipe(
      tap((x) => this.scoreLoading.set(x.loading)),
      onlyCompleteData(),
      map((x) => x.data.calculateScore as Score),
      finalize(() => this.scoreLoading.set(false))
    );
  }

  onScrollToQuestion(questionId: string): void {
    const element = this._document.getElementById(questionId);
    if (element) {
      const yOffset = -100; // Offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
}
