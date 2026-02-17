import { Route } from '@angular/router';
import { Home } from './home/home';

export default [
  {
    path: '',
    pathMatch: 'full',
    component: Home,
  },
  {
    path: ':id',
    component: Home,
  },
] satisfies Route[];
