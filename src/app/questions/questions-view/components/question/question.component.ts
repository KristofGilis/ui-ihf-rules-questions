import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Question } from '../../../../../../graphql/generated';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionComponent {
  readonly question = input.required<Question>();
  readonly selectAnswer = output<string>();
  readonly deselectAnswer = output<string>();
  readonly selectedAnswers = input<string[]>([]);

  onAnswerChange(event: Event, answerId: string | null | undefined): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectAnswer.emit(answerId ?? '');
    } else {
      this.deselectAnswer.emit(answerId ?? '');
    }
  }
}
