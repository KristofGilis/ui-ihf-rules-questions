import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Question } from '../../../../../../graphql/generated';

@Component({
  selector: 'app-question',
  imports: [CommonModule, FormsModule],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionComponent {
  readonly question = input.required<Question>();
  readonly selectAnswer = output<string>();
  readonly deselectAnswer = output<string>();

  onCheckboxChange(answerId: string, checked: boolean) {
    if (checked) {
      this.selectAnswer.emit(answerId);
    } else {
      this.deselectAnswer.emit(answerId);
    }
  }
}
