import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PageContainerComponent, QuizConfigCardComponent } from '../../shared/components';

@Component({
  selector: 'app-quiz-setup',
  standalone: true,
  imports: [TranslatePipe, PageContainerComponent, QuizConfigCardComponent],
  templateUrl: './quiz-setup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './quiz-setup.component.scss',
})
export class QuizSetupComponent {
  private readonly _router = inject(Router);

  onStartQuiz(config: { questionCount: number; timedMode: boolean }): void {
    this._router.navigate(['/quiz/view'], {
      state: {
        count: config.questionCount,
        timed: config.timedMode,
      },
    });
  }
}
