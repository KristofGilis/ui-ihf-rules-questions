import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { Question } from '../../../../../../graphql/generated';

@Component({
  selector: 'app-question',
  imports: [MatCheckbox],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionComponent {
  readonly question = input.required<Question>();
  readonly selectAnswer = output<string>();
  readonly deselectAnswer = output<string>();
}
