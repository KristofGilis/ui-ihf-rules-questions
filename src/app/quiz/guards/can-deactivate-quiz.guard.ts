import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { map } from 'rxjs';
import { QuizComponent } from '../quiz.component';
import { QuizService } from '../services/quiz.service';

export const canDeactivateQuiz: CanDeactivateFn<QuizComponent> = (
  component,
  _currentRoute,
  _currentState,
  nextState
) => {
  // Allow navigation to quiz results
  if (nextState?.url?.startsWith('/quiz/results')) {
    return true;
  }

  const quizService = inject(QuizService);
  const result = component.canDeactivate();

  // If result is a boolean and true, reset the quiz
  if (typeof result === 'boolean' && result) {
    quizService.resetQuiz();
    return true;
  }

  // If result is an Observable, reset after user confirms
  if (typeof result === 'object') {
    return result.pipe(
      map((confirmed) => {
        if (confirmed) {
          quizService.resetQuiz();
        }
        return confirmed;
      })
    );
  }

  return result;
};
