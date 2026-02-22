import { Route } from '@angular/router';
import { Cashier } from '@/features/orders';

export default [
  {
    path: '',
    pathMatch: 'full',
    component: Cashier,
  },
  {
    path: ':id/edit',
    component: Cashier,
  },
] satisfies Route[];
