import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./search.component').then((m) => m.SearchComponent),
  },
] satisfies Routes;
