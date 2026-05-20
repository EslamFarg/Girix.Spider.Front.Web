import { Route } from '@angular/router';
import { DeliveryMen } from '@/features/deliveries/pages/delivery-men/delivery-men';
import { AddDeliveryMan } from '@/features/deliveries/pages/add-delivery-man/add-delivery-man';
import { EditDeliveryMan } from '@/features/deliveries/pages/edit-delivery-man/edit-delivery-man';
import { AssignToDelivery } from '@/features/orders/pages/assign-to-delivery/assign-to-delivery';

export default [
  {
    path: 'delivery-men',
    component: DeliveryMen,
  },
  {
    path: 'delivery-men/add',
    component: AddDeliveryMan,
  },
  {
    path: 'delivery-men/:id/edit',
    component: EditDeliveryMan,
  },
  {
    path: 'assign-orders',
    component: AssignToDelivery,
  },
] satisfies Route[];
