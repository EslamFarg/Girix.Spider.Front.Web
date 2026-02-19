import { Route } from '@angular/router';

import { All } from '@/features/collections/pages/all/all';
import { Tables } from '@/features/collections/pages/tables/tables';
import { Rooms } from '@/features/collections/pages/rooms/rooms';
import { Huts } from '@/features/collections/pages/huts/huts';
import { Deliveries } from '@/features/collections/pages/deliveries/deliveries';

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
] satisfies Route[];
