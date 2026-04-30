import { Route } from '@angular/router';
import { Orders } from '@/features/orders';
import { Refunds } from '@/features/refunds/pages/refunds/refunds';
import { AddRefund } from '@/features/refunds/pages/add-refund/add-refund';
import { EditRefund } from '@/features/refunds/pages/edit-refund/edit-refund';

export default [
  {
    path: 'orders',
    component: Orders,
  },
  {
    path: 'refunds',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: Refunds,
      },
      {
        path: 'add',
        component: AddRefund,
      },
      {
        path: ':id/edit',
        component: EditRefund,
      }
    ]
  },
] satisfies Route[];
