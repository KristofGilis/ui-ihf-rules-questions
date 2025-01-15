import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { Question, Score } from '../../../../../../graphql/generated';

@Component({
  selector: 'app-score-overview',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    TranslateModule,
  ],
  templateUrl: './score-overview.component.html',
  styleUrl: './score-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreOverviewComponent {
  @Input({ required: true }) score?: Score;
  @Input({ required: true }) questions: Question[] = [];

  get isBadResult(): boolean {
    if (this.score) {
      return (this.score.score ?? 0) / (this.score.total ?? 0) < 0.5;
    }

    return true;
  }

  getQuestionNumber(id?: string | null): string | undefined {
    return this.questions.find((x) => x.id === id)?.number ?? undefined;
  }
}
