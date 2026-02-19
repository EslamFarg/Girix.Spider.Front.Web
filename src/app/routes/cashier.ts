import { Route } from '@angular/router';
import { Cashier } from '@/features/orders';

export default [
  {
    path: '',
    pathMatch: 'full',
    component: Cashier,
  },
  {
    path: ':id',
    component: Cashier,
  },
] satisfies Route[];
