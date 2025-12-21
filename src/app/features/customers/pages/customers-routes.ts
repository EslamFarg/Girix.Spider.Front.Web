import { Route } from '@angular/router';
import { Customers } from './customers/customers';
import { AddCustomer } from './add-customer/add-customer';

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
] satisfies Route[];
