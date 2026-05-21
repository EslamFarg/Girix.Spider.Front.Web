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
import { JournalsLayout } from '@/features/accounts/layouts/journals-layout/journals-layout';
import { AddJournal } from '@/features/accounts/pages/add-journal/add-journal';
import { EditJournal } from '@/features/accounts/pages/edit-journal/edit-journal';
import { Customers } from '@/features/customers/pages/customers/customers';
import { AddCustomer } from '@/features/customers/pages/add-customer/add-customer';
import { EditCustomer } from '@/features/customers/pages/edit-customer/edit-customer';
import { CustomersLayout } from '@/features/customers/layouts/customers-layout/customers-layout';
import { SuppliersLayout } from '@/features/suppliers/layouts/suppliers-layout/suppliers-layout';
import { Suppliers } from '@/features/suppliers/pages/suppliers/suppliers';
import { AddSupplier } from '@/features/suppliers/pages/add-supplier/add-supplier';
import { EditSupplier } from '@/features/suppliers/pages/edit-supplier/edit-supplier';
export default [
  {
    path: 'journals',
    component: JournalsLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: Journals,
      },
      {
        path: 'add',
        component: AddJournal,
      },
      {
        path: ':id/edit',
        component: EditJournal,
      },
    ],
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
    {
    path: 'customers',
    component: CustomersLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: Customers,
      },
      {
        path: 'add',
        component: AddCustomer,
      },
      {
        path: ':id/edit',
        component: EditCustomer,
      },
    ],
  },
  {
    path: 'suppliers',
    component: SuppliersLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: Suppliers,
      },
      {
        path: 'add',
        component: AddSupplier,
      },
      {
        path: ':id/edit',
        component: EditSupplier,
      },
    ],
  },
] satisfies Route[];
