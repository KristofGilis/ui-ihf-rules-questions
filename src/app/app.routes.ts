import { Routes } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

_('navigation.home');
_('navigation.rules');
_('navigation.questions');
_('navigation.quiz');

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'rules',
    loadChildren: () => import('./rules/rules.routes').then((r) => r.RULES_ROUTES),
  },
  {
    path: 'questions',
    loadChildren: () => import('./questions/questions.routes').then((r) => r.QUESTIONS_ROUTES),
  },
  {
    path: 'quiz',
    loadComponent: () => import('./quiz/quiz.component').then((m) => m.QuizComponent),
  },
];
