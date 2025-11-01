import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal, viewChildren } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRedo, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { Question, Score } from '../../../../graphql/generated';
import { QuestionComponent } from './components/question/question.component';
import { ScoreOverviewComponent } from './components/score-overview/score-overview.component';

@Component({
  selector: 'app-questions-view',
  imports: [CommonModule, QuestionComponent, TranslatePipe, ScoreOverviewComponent, FontAwesomeModule],
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

  readonly questionComponents = viewChildren(QuestionComponent);

  readonly faSpinner = faSpinner;
  readonly faRedo = faRedo;

  readonly selectedAnswers = signal<string[]>([]);

  onSelectAnswer(id: string): void {
    this.selectedAnswers.update((answers) => [...answers, id]);
  }

  onDeselectAnswer(id: string): void {
    this.selectedAnswers.update((answers) => answers.filter((answerId) => answerId !== id));
  }

  onCalculateScore(): void {
    if (!this.hasMoreQuestions()) {
      this.calculareScore.emit({
        questionIds: this.questions().map((x) => x.id),
        selectedAnswerIds: this.selectedAnswers(),
      });
    }
  }

  isQuestionWrong(questionId: string): boolean {
    return this.score()?.wrongQuestionsIds?.includes(questionId) ?? false;
  }

  scrollToQuestion(questionId: string): void {
    const questionComponent = this.questionComponents().find((comp) => comp.question().id === questionId);
    if (questionComponent) {
      questionComponent.elementRef.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }
}
