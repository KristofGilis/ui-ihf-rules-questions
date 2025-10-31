import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faHome, faRedo, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-quiz-results',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, FontAwesomeModule],
  templateUrl: './quiz-results.component.html',
  styleUrl: './quiz-results.component.scss',
})
export class QuizResultsComponent implements OnInit {
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;
  faRedo = faRedo;
  faHome = faHome;

  constructor(public quizService: QuizService) {}

  ngOnInit() {
    // If no results, navigate back to home
    if (!this.quizService.results()) {
      window.location.href = '/';
    }
  }

  getScoreColor(): string {
    const results = this.quizService.results();
    if (!results) return 'text-gray-900';

    const percentage = results.percentage;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  retakeQuiz() {
    this.quizService.resetQuiz();
  }
}
