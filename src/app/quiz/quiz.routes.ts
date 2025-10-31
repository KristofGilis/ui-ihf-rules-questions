import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./quiz.component').then((m) => m.QuizComponent),
  },
  {
    path: 'results',
    loadComponent: () => import('./quiz-results/quiz-results.component').then((m) => m.QuizResultsComponent),
  },
] satisfies Routes;
