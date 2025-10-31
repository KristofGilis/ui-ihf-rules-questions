import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'main.title',
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'questions',
    loadChildren: () => import('./questions/questions.routes'),
  },
  {
    path: 'quiz',
    loadChildren: () => import('./quiz/quiz.routes'),
  },
  {
    path: 'rules',
    loadChildren: () => import('./rules/rules.routes'),
  },
];
