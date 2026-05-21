import { Route } from '@angular/router';
import { Orders } from '@/features/orders';
import { Refunds } from '@/features/refunds/pages/refunds/refunds';
import { AddRefund } from '@/features/refunds/pages/add-refund/add-refund';
import { EditRefund } from '@/features/refunds/pages/edit-refund/edit-refund';
import { Rooms } from '@/features/replacements/pages/rooms/rooms';
import { Huts } from '@/features/replacements/pages/huts/huts';
import { Tables } from '@/features/replacements/pages/tables/tables';
import { RepalcementsLayout } from '@/features/replacements/layouts/repalcements-layout/repalcements-layout';
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
      },
    ],
  },
  {
    path: 'replacements',
    component: RepalcementsLayout,
    children: [
      {
        path: 'rooms',
        component: Rooms,
      },
      {
        path: 'huts',
        component: Huts,
      },
      {
        path: 'tables',
        component: Tables,
      },
    ],
  },
] satisfies Route[];
