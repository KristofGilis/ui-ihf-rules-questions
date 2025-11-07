import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Input() questionCount = 10;
  @Input() timedMode = false;
  @Input() title = 'home.quiz_card.title';
  @Output() start = new EventEmitter<QuizConfig>();

  readonly faClock = faClock;
  readonly faArrowRight = faArrowRight;

  onStartQuiz(): void {
    this.start.emit({
      questionCount: this.questionCount,
      timedMode: this.timedMode,
    });
  }
}
