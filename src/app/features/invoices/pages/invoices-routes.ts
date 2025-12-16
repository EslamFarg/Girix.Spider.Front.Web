import { Route } from '@angular/router';
import { Orders } from '@/features/invoices/pages/orders/orders';
import { Refunds } from '@/features/invoices/pages/refunds/refunds';

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
