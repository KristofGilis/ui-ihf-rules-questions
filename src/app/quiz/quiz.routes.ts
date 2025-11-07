import { Routes } from '@angular/router';
import { canDeactivateQuiz } from './guards/can-deactivate-quiz.guard';

export default [
  {
    path: '',
    loadComponent: () => import('./quiz-setup/quiz-setup.component').then((m) => m.QuizSetupComponent),
  },
  {
    path: 'view',
    loadComponent: () => import('./quiz.component').then((m) => m.QuizComponent),
    canDeactivate: [canDeactivateQuiz],
  },
  {
    path: 'results',
    loadComponent: () => import('./quiz-results/quiz-results.component').then((m) => m.QuizResultsComponent),
  },
] satisfies Routes;
