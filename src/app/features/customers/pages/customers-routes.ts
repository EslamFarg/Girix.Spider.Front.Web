import { Route } from '@angular/router';
import { Customers } from './customers/customers';
import { AddCustomer } from './add-customer/add-customer';
import { EditCustomer } from './edit-customer/edit-customer';

export default [
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
] satisfies Route[];
