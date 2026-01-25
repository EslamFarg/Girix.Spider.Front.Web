import { Route } from '@angular/router';
import { Customers } from './customers/customers';
import { AddCustomer } from './add-customer/add-customer';
import { EditCustomer } from './edit-customer/edit-customer';
import { CustomersLayout } from '../layouts/customers-layout/customers-layout';

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
