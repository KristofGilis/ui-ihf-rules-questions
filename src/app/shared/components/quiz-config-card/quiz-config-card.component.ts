import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowRight, faClock } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';

export interface QuizConfig {
  questionCount: number;
  timedMode: boolean;
}

@Component({
  selector: 'app-quiz-config-card',
  imports: [FormsModule, TranslatePipe, FaIconComponent],
  templateUrl: './quiz-config-card.component.html',
  styleUrl: './quiz-config-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizConfigCardComponent {
  readonly title = input('home.quiz_card.title');
  readonly startQuiz = output<QuizConfig>();

  readonly questionCount = model(10);
  readonly timedMode = model(false);

  readonly faClock = faClock;
  readonly faArrowRight = faArrowRight;

  onStartQuiz(): void {
    this.startQuiz.emit({
      questionCount: this.questionCount(),
      timedMode: this.timedMode(),
    });
  }
}
