import { Routes } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { HomeComponent } from './home/home.component';

_('navigation.home');
_('navigation.rules');
_('navigation.questions');

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'rules',
    loadChildren: () =>
      import('./rules/rules.routes').then((r) => r.RULES_ROUTES),
  },
  {
    path: 'questions',
    loadChildren: () =>
      import('./questions/questions.routes').then((r) => r.QUESTIONS_ROUTES),
  },
];
