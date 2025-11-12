import { Component, input, model, output } from '@angular/core';
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
  standalone: true,
  imports: [FormsModule, TranslatePipe, FaIconComponent],
  templateUrl: './quiz-config-card.component.html',
  styleUrl: './quiz-config-card.component.scss',
})
export class QuizConfigCardComponent {
  title = input('home.quiz_card.title');
  startQuiz = output<QuizConfig>();

  questionCount = model(10);
  timedMode = model(false);

  readonly faClock = faClock;
  readonly faArrowRight = faArrowRight;

  onStartQuiz(): void {
    this.startQuiz.emit({
      questionCount: this.questionCount(),
      timedMode: this.timedMode(),
    });
  }
}
