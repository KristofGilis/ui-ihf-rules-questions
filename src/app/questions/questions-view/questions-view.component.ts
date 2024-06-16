import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { Question, Score } from '../../../../graphql/generated';
import { QuestionComponent } from './components/question/question.component';
import { ScoreOverviewComponent } from './components/score-overview/score-overview.component';

@Component({
  selector: 'app-questions-view',
  standalone: true,
  imports: [
    MatProgressSpinner,
    QuestionComponent,
    MatButton,
    TranslateModule,
    ScoreOverviewComponent,
  ],
  templateUrl: './questions-view.component.html',
  styleUrl: './questions-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionsViewComponent {
  @Input({ required: true }) questions: Question[] = [];
  @Input({ required: true }) loading = false;
  @Input({ required: true }) hasMoreQuestions = true;
  @Input({ required: true }) score?: Score;
  @Input({ required: true }) scoreLoading = false;
  @Output() calculareScore = new EventEmitter<{
    questionIds: string[];
    selectedAnswerIds: string[];
  }>();

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
    if (!this.hasMoreQuestions) {
      this.calculareScore.emit({
        questionIds: this.questions.map((x) => x.id),
        selectedAnswerIds: this.selectedAnswers,
      });
    }
  }
}
