import { CanDeactivateFn } from '@angular/router';
import { QuizComponent } from '../quiz.component';

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

  return component.canDeactivate();
};
