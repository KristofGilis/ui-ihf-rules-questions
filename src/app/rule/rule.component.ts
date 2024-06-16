import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Observable, finalize, map, tap } from 'rxjs';
import { Question, Rule, Score } from '../../../graphql/generated';
import { QuestionsViewComponent } from '../questions/questions-view/questions-view.component';
import { QuestionsService } from '../questions/services/questions.service';
import { RuleService } from './services/rule.service';

@Component({
  selector: 'app-rule',
  standalone: true,
  imports: [AsyncPipe, QuestionsViewComponent],
  templateUrl: './rule.component.html',
  styleUrl: './rule.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleComponent {
  private _activatedRoute = inject(ActivatedRoute);
  private _ruleService = inject(RuleService);
  private _questionsService = inject(QuestionsService);
  private _scrollDispatcher = inject(ScrollDispatcher);

  loading = false;
  rule$: Observable<Rule>;
  score$?: Observable<Score>;
  scoreLoading = false;

  get hasMoreQuestions(): boolean {
    return this._ruleService.hasNextPage;
  }

  constructor() {
    this.rule$ = this._ruleService
      .get(this._activatedRoute.snapshot.params['id'])
      .pipe(
        tap((x) => (this.loading = x.loading)),
        map((x) => x.data?.ruleById as Rule),
        finalize(() => (this.loading = false))
      );

    this._scrollDispatcher
      .scrolled()
      .pipe(takeUntilDestroyed())
      .subscribe((res) => {
        if ((res as CdkScrollable).measureScrollOffset('bottom') < 50) {
          this._ruleService.fetchMoreQuestions();
        }
      });
  }

  getQuestions(rule: Rule | null): Question[] {
    return rule?.questions?.edges?.map((x) => x.node) ?? [];
  }

  getRuleName(rule: Rule | null): string | undefined {
    if (rule) {
      return `${rule.number} - ${rule.name}`;
    }

    return undefined;
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
}
