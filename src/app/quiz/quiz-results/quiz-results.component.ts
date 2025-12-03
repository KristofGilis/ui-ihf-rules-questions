import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faHome, faRedo, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslatePipe } from '@ngx-translate/core';
import { GradientButtonComponent, PageContainerComponent } from '../../shared/components';
import { QuizService } from '../services/quiz.service';

@Component({
  selector: 'app-quiz-results',
  imports: [RouterLink, TranslatePipe, FaIconComponent, PageContainerComponent, GradientButtonComponent],
  templateUrl: './quiz-results.component.html',
  styleUrls: ['./quiz-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizResultsComponent implements OnInit {
  private readonly _router = inject(Router);
  readonly quizService = inject(QuizService);

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
    const results = this.quizService.results();
    if (!results) {
      this._router.navigate(['/']);
    }
  }

  retakeQuiz() {
    this.quizService.resetQuiz();
  }
}
