import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { Question, Score } from '../../../../../../graphql/generated';

@Component({
  selector: 'app-score-overview',
  imports: [CommonModule, TranslatePipe, FontAwesomeModule],
  templateUrl: './score-overview.component.html',
  styleUrl: './score-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreOverviewComponent {
  readonly score = input.required<Score | undefined>();
  readonly questions = input.required<Question[]>();

  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;

  get isBadResult(): boolean {
    const score = this.score();
    if (score) {
      return (score.score ?? 0) / (score.total ?? 0) < 0.5;
    }

    return true;
  }

  getQuestionNumber(id?: string | null): string | undefined {
    return this.questions().find((x) => x.id === id)?.number ?? undefined;
  }
}
