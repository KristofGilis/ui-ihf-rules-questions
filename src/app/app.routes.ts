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
    loadChildren: () => import('./rules/rules.routes'),
  },
  {
    path: 'questions',
    loadChildren: () => import('./questions/questions.routes'),
  },
  {
    path: 'quiz',
    loadChildren: () => import('./quiz/quiz.routes'),
  },
];
