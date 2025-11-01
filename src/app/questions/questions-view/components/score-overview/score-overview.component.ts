import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRotateRight, faSpinner, faThumbsUp, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { Question, Score } from '../../../../../../graphql/generated';
import { GradientButtonComponent, LoadingSpinnerComponent } from '../../../../shared/components';

@Component({
  selector: 'app-score-overview',
  imports: [CommonModule, TranslatePipe, FontAwesomeModule, GradientButtonComponent, LoadingSpinnerComponent],
  templateUrl: './score-overview.component.html',
  styleUrl: './score-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreOverviewComponent {
  readonly score = input.required<Score | undefined>();
  readonly questions = input.required<Question[]>();
  readonly compact = input(false); // For mobile dialog
  readonly scoreLoading = input(false); // For recalculate button
  readonly scrollToQuestion = output<string>();
  readonly recalculate = output<void>();
  readonly restart = output<void>();

  readonly faThumbsUp = faThumbsUp;
  readonly faTimesCircle = faTimesCircle;
  readonly faRotateRight = faRotateRight;
  readonly faSpinner = faSpinner;

  readonly isBadResult = computed(() => {
    const score = this.score();
    if (score) {
      return (score.score ?? 0) / (score.total ?? 0) < 0.5;
    }
    return true;
  });

  getQuestionNumber(id?: string | null): string | undefined {
    return this.questions().find((x) => x.id === id)?.number ?? undefined;
  }

  onQuestionClick(questionId?: string | null) {
    if (questionId) {
      this.scrollToQuestion.emit(questionId);
    }
  }
}

