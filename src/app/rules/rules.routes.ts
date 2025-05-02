import { Routes } from '@angular/router';



export const RULES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./rules.component').then(m => m.RulesComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('../rule/rule.component').then(m => m.RuleComponent),
  },
];
