import { Route } from '@angular/router';
import { Home } from '@/features/general/pages/home/home';
import { Journals } from './journals/journals';
import { CollectivePayments } from './collective-payments/collective-payments';
import { CollectiveReceipts } from './collective-receipts/collective-receipts';
import { AddCollectiveReceipt } from './add-collective-receipt/add-collective-receipt';
import { EditCollectiveReceipt } from './edit-collective-receipt/edit-collective-receipt';
import { AccountsTree } from './accounts-tree/accounts-tree';

export default [
  {
    path: 'journals',
    component: Journals,
  },
  //collective payments
  {
    path: 'collective-payments',
    component: CollectivePayments,
  },
  {
    path: 'collective-payments/add',
    component: Home,
  },
  {
    path: 'collective-payments/:id/edit',
    component: Home,
  },
  //collective receipts
  {
    path: 'collective-receipts',
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
  //accounts tree
  {
    path: 'accounts-tree',
    component: AccountsTree,
  },
] satisfies Route[];
