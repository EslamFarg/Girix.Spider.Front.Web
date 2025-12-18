import { Route } from '@angular/router';
import { OpeningBalances } from '@/features/storage/pages/opening-balances/opening-balances';
import { Purchases } from './purchases/purchases';
import { Inventory } from './inventory/inventory';
import { AddOpeningBalances } from './add-opening-balances/add-opening-balances';
import { AddPurchases } from './add-purchases/add-purchases';
import { AddPurchasesRefunds } from './add-purchases-refunds/add-purchases-refunds';
import { PurchasesRefunds } from './purchases-refunds/purchases-refunds';

export default [
  //opening-balances
  {
    path: 'opening-balances',
    component: OpeningBalances,
  },
  {
    path: 'opening-balances/add',
    component: AddOpeningBalances,
  },
  //purchases
  {
    path: 'purchases',
    component: Purchases,
  },
  {
    path: 'purchases/add',
    component: AddPurchases,
  },
  //purchases-returns
  {
    path: 'purchases-refunds',
    component: PurchasesRefunds,
  },
  {
    path: 'purchases-refunds/add',
    component: AddPurchasesRefunds,
  },
  //inventory
  {
    path: 'inventory',
    component: Inventory,
  },
] satisfies Route[];
