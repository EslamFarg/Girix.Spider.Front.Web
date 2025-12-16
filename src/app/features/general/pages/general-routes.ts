import { Route } from '@angular/router';
import { Home } from '@/features/general/pages/home/home';

export default [
  {
    path: '',
    pathMatch: 'full',
    component: Home,
  },
] satisfies Route[];
