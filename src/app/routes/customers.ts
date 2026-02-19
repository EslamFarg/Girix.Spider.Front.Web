import { Route } from '@angular/router';
import { Customers } from '@/features/customers/pages/customers/customers';
import { AddCustomer } from '@/features/customers/pages/add-customer/add-customer';
import { EditCustomer } from '@/features/customers/pages/edit-customer/edit-customer';
import { CustomersLayout } from '@/features/customers/layouts/customers-layout/customers-layout';

export default [
  {
    path: '',
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
] satisfies Route[];
