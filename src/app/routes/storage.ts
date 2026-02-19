import { Route } from '@angular/router';
import { OpeningBalances } from '@/features/storage/pages/opening-balances/opening-balances';
import { Purchases } from '@/features/storage/pages/purchases/purchases';
import { Inventory } from '@/features/storage/pages/inventory/inventory';
import { AddOpeningBalances } from '@/features/storage/pages/add-opening-balances/add-opening-balances';
import { AddPurchases } from '@/features/storage/pages/add-purchases/add-purchases';
import { AddPurchasesRefunds } from '@/features/storage/pages/add-purchases-refunds/add-purchases-refunds';
import { PurchasesRefunds } from '@/features/storage/pages/purchases-refunds/purchases-refunds';
import { OpeningBalancesLayout } from '@/features/storage/layouts/opening-balances-layout/opening-balances-layout';
import { PurchasesLayout } from '@/features/storage/layouts/purchases-layout/purchases-layout';
import { PurchasesRefundsLayout } from '@/features/storage/layouts/purchases-refunds-layout/purchases-refunds-layout';

export default [
  //opening-balances
  {
    path: 'opening-balances',
    component: OpeningBalancesLayout,
    children: [
      {
        path: '',
        component: OpeningBalances,
      },
      {
        path: 'add',
        component: AddOpeningBalances,
      },
    ],
  },

  //purchases
  {
    path: 'purchases',
    component: PurchasesLayout,
    children: [
      {
        path: '',
        component: Purchases,
      },
      {
        path: 'add',
        component: AddPurchases,
      },
    ],
  },

  //purchases-refunds
  {
    path: 'purchases-refunds',
    component: PurchasesRefundsLayout,
    children: [
      {
        path: '',
        component: PurchasesRefunds,
      },
      {
        path: 'add',
        component: AddPurchasesRefunds,
      },
    ],
  },

  //inventory
  {
    path: 'inventory',
    component: Inventory,
  },
] satisfies Route[];
