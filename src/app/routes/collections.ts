import { Route } from '@angular/router';

import { All } from '@/features/collections/pages/all/all';
import { Tables } from '@/features/collections/pages/tables/tables';
import { Rooms } from '@/features/collections/pages/rooms/rooms';
import { Huts } from '@/features/collections/pages/huts/huts';
import { Deliveries } from '@/features/collections/pages/deliveries/deliveries';
import { CompanyDeliveries } from '@/features/collections/pages/company-deliveries/company-deliveries';

export default [
  {
    path: 'all',
    component: All,
  },
  {
    path: 'tables',
    component: Tables,
  },
  {
    path: 'rooms',
    component: Rooms,
  },
  {
    path: 'huts',
    component: Huts,
  },
  {
    path: 'deliveries',
    component: Deliveries,
  },
  {
    path: 'company-deliveries',
    component: CompanyDeliveries,
  },
] satisfies Route[];
