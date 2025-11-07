import { NgClass } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faHome, faRedo, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { QuizService } from '../../services/quiz.service';
import { GradientButtonComponent, PageContainerComponent } from '../../shared/components';

@Component({
  selector: 'app-quiz-results',
  standalone: true,
  imports: [NgClass, RouterLink, TranslatePipe, FaIconComponent, PageContainerComponent, GradientButtonComponent],
  templateUrl: './quiz-results.component.html',
  styleUrl: './quiz-results.component.scss',
})
export class QuizResultsComponent implements OnInit {
  readonly quizService = inject(QuizService);
  private readonly _router = inject(Router);

  readonly faCheckCircle = faCheckCircle;
  readonly faTimesCircle = faTimesCircle;
  readonly faRedo = faRedo;
  readonly faHome = faHome;

  readonly scoreColor = computed(() => {
    const results = this.quizService.results();
    if (!results) return 'text-slate-900';

    const percentage = results.percentage;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  });

  ngOnInit() {
    // If no results, navigate back to home
    if (!this.quizService.results()) {
      this._router.navigate(['/']);
    }
  }

  retakeQuiz() {
    this.quizService.resetQuiz();
  }
}
