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
  
  selectedAnswers = new Set<string>();
  
  toggleAnswer(answerId: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedAnswers.add(answerId);
      this.selectAnswer.emit(answerId);
    } else {
      this.selectedAnswers.delete(answerId);
      this.deselectAnswer.emit(answerId);
    }
  }
  
  isAnswerSelected(answerId: string): boolean {
    return this.selectedAnswers.has(answerId);
  }
}
