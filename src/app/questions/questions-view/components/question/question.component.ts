import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { Question } from '../../../../../../graphql/types';

@Component({
  selector: 'app-question',
  imports: [FormsModule, FaIconComponent, TranslatePipe],
  templateUrl: './question.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionComponent {
  readonly question = input.required<Question>();
  readonly isWrong = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly selectAnswer = output<string>();
  readonly deselectAnswer = output<string>();

  readonly elementRef = inject(ElementRef);

  readonly faTimesCircle = faTimesCircle;

  onCheckboxChange(answerId: string, checked: boolean) {
    if (checked) {
      this.selectAnswer.emit(answerId);
    } else {
      this.deselectAnswer.emit(answerId);
    }
  }
}
