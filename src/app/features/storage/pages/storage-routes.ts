import { Route } from '@angular/router';
import { OpeningBalances } from '@/features/storage/pages/opening-balances/opening-balances';
import { Purchases } from './purchases/purchases';
import { Inventory } from './inventory/inventory';
import { AddOpeningBalances } from './add-opening-balances/add-opening-balances';
import { AddPurchases } from './add-purchases/add-purchases';
import { AddPurchasesRefunds } from './add-purchases-refunds/add-purchases-refunds';
import { PurchasesRefunds } from './purchases-refunds/purchases-refunds';
import { OpeningBalancesLayout } from '../layouts/opening-balances-layout/opening-balances-layout';
import { PurchasesLayout } from '../layouts/purchases-layout/purchases-layout';
import { PurchasesRefundsLayout } from '../layouts/purchases-refunds-layout/purchases-refunds-layout';

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
