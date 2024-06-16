import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { Question } from '../../../../../../graphql/generated';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [MatCheckbox],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionComponent {
  @Input({ required: true }) question?: Question;
  @Output() selectAnswer = new EventEmitter<string>();
  @Output() deselectAnswer = new EventEmitter<string>();
}
