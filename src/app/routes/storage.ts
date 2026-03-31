import { Route } from '@angular/router';
import { OpeningBalances } from '@/features/storage/pages/opening-balances/opening-balances';
import { Purchases } from '@/features/storage/pages/purchases/purchases';
import { Inventory } from '@/features/storage/pages/inventory/inventory';
import { AddOpeningBalance } from '@/features/storage/pages/add-opening-balance/add-opening-balance';
import { AddPurchases } from '@/features/storage/pages/add-purchases/add-purchases';
import { AddPurchaseReturn } from '@/features/storage/pages/add-purchase-return/add-purchase-return';
import { PurchasesReturns } from '@/features/storage/pages/purchases-returns/purchases-returns';
import { OpeningBalancesLayout } from '@/features/storage/layouts/opening-balances-layout/opening-balances-layout';
import { PurchasesLayout } from '@/features/storage/layouts/purchases-layout/purchases-layout';
import { PurchasesReturnsLayout } from '@/features/storage/layouts/purchases-returns-layout/purchases-returns-layout';
import { EditOpeningBalance } from '@/features/storage/pages/edit-opening-balance/edit-opening-balance';
import { EditPurchases } from '@/features/storage/pages/edit-purchases/edit-purchases';
import { EditPurchaseReturn } from '@/features/storage/pages/edit-purchase-return/edit-purchase-return';

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
        component: AddOpeningBalance,
      },
      {
        path: ':id/edit',
        component: EditOpeningBalance,
      }
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
      {
        path: ':id/edit',
        component: EditPurchases,
      },
    ],
  },

  //purchases-refunds
  {
    path: 'purchases-returns',
    component: PurchasesReturnsLayout,
    children: [
      {
        path: '',
        component: PurchasesReturns,
      },
      {
        path: 'add',
        component: AddPurchaseReturn,
      },
      {
        path: ':id/edit',
        component: EditPurchaseReturn,
      },
    ],
  },

  //inventory
  {
    path: 'inventory',
    component: Inventory,
  },
] satisfies Route[];
