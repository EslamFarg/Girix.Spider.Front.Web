import { Route } from '@angular/router';
import { Journals } from '@/features/accounts/pages/journals/journals';
import { CollectivePayments } from '@/features/accounts/pages/collective-payments/collective-payments';
import { CollectiveReceipts } from '@/features/accounts/pages/collective-receipts/collective-receipts';
import { AddCollectiveReceipt } from '@/features/accounts/pages/add-collective-receipt/add-collective-receipt';
import { EditCollectiveReceipt } from '@/features/accounts/pages/edit-collective-receipt/edit-collective-receipt';
import { AccountsTree } from '@/features/accounts/pages/accounts-tree/accounts-tree';
import { AddCollectivePayment } from '@/features/accounts/pages/add-collective-payment/add-collective-payment';
import { EditCollectivePayment } from '@/features/accounts/pages/edit-collective-payment/edit-collective-payment';
import { CollectivePaymentsLayout } from '@/features/accounts/layouts/collective-payments-layout/collective-payments-layout';
import { CollectiveReceiptsLayout } from '@/features/accounts/layouts/collective-receipts-layout/collective-receipts-layout';

export default [
  {
    path: 'journals',
    component: Journals,
  },
  //collective payments
  {
    path: 'collective-payments',
    component: CollectivePaymentsLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: CollectivePayments,
      },
      {
        path: 'add',
        component: AddCollectivePayment,
      },
      {
        path: ':id/edit',
        component: EditCollectivePayment,
      },
    ],
  },

  //collective receipts
  {
    path: 'collective-receipts',
    component: CollectiveReceiptsLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: CollectiveReceipts,
      },
      {
        path: 'add',
        component: AddCollectiveReceipt,
      },
      {
        path: ':id/edit',
        component: EditCollectiveReceipt,
      },
    ],
  },

  //accounts tree
  {
    path: 'accounts-tree',
    component: AccountsTree,
  },
] satisfies Route[];
