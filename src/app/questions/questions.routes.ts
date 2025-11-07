import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./questions.component').then((m) => m.QuestionsComponent),
  },
] satisfies Routes;
