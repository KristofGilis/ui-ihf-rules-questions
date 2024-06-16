import { Routes } from '@angular/router';
import { RuleComponent } from '../rule/rule.component';
import { RulesComponent } from './rules.component';

export const RULES_ROUTES: Routes = [
  {
    path: '',
    component: RulesComponent,
  },
  {
    path: ':id',
    component: RuleComponent,
  },
];
