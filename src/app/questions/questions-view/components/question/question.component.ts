import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Question } from '../../../../../../graphql/generated';

@Component({
  selector: 'app-question',
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionComponent {
  readonly question = input.required<Question>();
  readonly isWrong = input<boolean>(false);
  readonly selectAnswer = output<string>();
  readonly deselectAnswer = output<string>();

  faTimesCircle = faTimesCircle;

  constructor(public elementRef: ElementRef) {}

  onCheckboxChange(answerId: string, checked: boolean) {
    if (checked) {
      this.selectAnswer.emit(answerId);
    } else {
      this.deselectAnswer.emit(answerId);
    }
  }
}
