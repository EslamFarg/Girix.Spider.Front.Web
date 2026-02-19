import { Route } from '@angular/router';
import { Orders } from '@/features/orders';
import { Refunds } from '@/features/refunds/pages/refunds/refunds';

export default [
  {
    path: 'orders',
    component: Orders,
  },
  {
    path: 'refunds',
    component: Refunds,
  },
] satisfies Route[];
