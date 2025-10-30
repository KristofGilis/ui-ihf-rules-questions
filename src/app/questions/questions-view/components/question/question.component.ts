import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Question } from '../../../../../../graphql/generated';

@Component({
  selector: 'app-question',
  imports: [CommonModule],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionComponent {
  readonly question = input.required<Question>();
  readonly selectAnswer = output<string>();
  readonly deselectAnswer = output<string>();
  readonly selectedAnswers = input<string[]>([]);
  readonly showFeedback = input(false);

  onAnswerChange(event: Event, answerId: string): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectAnswer.emit(answerId);
    } else {
      this.deselectAnswer.emit(answerId);
    }
  }
}
