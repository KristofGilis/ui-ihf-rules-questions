import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Question, Score } from '../../../../graphql/generated';
import { QuestionComponent } from './components/question/question.component';
import { ScoreOverviewComponent } from './components/score-overview/score-overview.component';

@Component({
  selector: 'app-questions-view',
  imports: [CommonModule, QuestionComponent, TranslatePipe, ScoreOverviewComponent],
  templateUrl: './questions-view.component.html',
  styleUrl: './questions-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionsViewComponent {
  readonly questions = input.required<Question[]>();
  readonly loading = input.required<boolean>();
  readonly hasMoreQuestions = input.required<boolean>();
  readonly score = input.required<Score | undefined>();
  readonly scoreLoading = input.required<boolean>();
  readonly isRandom = input(false);
  readonly randomCount = input<number>();
  readonly calculareScore = output<{
    questionIds: string[];
    selectedAnswerIds: string[];
  }>();
  readonly newRandomQuestions = output();

  selectedAnswers: string[] = [];

  onSelectAnswer(id: string): void {
    this.selectedAnswers = [...this.selectedAnswers, id];
  }

  onDeselectAnswer(id: string): void {
    if (this.selectedAnswers.includes(id)) {
      this.selectedAnswers.splice(this.selectedAnswers.indexOf(id), 1);
    }
  }

  onCalculateScore(): void {
    if (!this.hasMoreQuestions()) {
      this.calculareScore.emit({
        questionIds: this.questions().map((x) => x.id),
        selectedAnswerIds: this.selectedAnswers,
      });
    }
  }
}
