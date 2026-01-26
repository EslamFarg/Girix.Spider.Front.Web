import { Route } from '@angular/router';
import { Journals } from './journals/journals';
import { CollectivePayments } from './collective-payments/collective-payments';
import { CollectiveReceipts } from './collective-receipts/collective-receipts';
import { AddCollectiveReceipt } from './add-collective-receipt/add-collective-receipt';
import { EditCollectiveReceipt } from './edit-collective-receipt/edit-collective-receipt';
import { AccountsTree } from './accounts-tree/accounts-tree';
import { AddCollectivePayment } from './add-collective-payment/add-collective-payment';
import { EditCollectivePayment } from './edit-collective-payment/edit-collective-payment';
import { CollectivePaymentsLayout } from '../layouts/collective-payments-layout/collective-payments-layout';
import { CollectiveReceiptsLayout } from '../layouts/collective-receipts-layout/collective-receipts-layout';

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
        path: 'collective-payments/add',
        component: AddCollectivePayment,
      },
      {
        path: 'collective-payments/:id/edit',
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
        path: 'collective-receipts/add',
        component: AddCollectiveReceipt,
      },
      {
        path: 'collective-receipts/:id/edit',
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
