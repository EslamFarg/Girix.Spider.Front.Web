import { Route } from '@angular/router';
import { Rooms } from '@/features/replacements/pages/rooms/rooms';
import { Cabins } from '@/features/replacements/pages/cabins/cabins';
import { Tables } from '@/features/replacements/pages/tables/tables';
import { Deliveries } from '@/features/replacements/pages/deliveries/deliveries';

export default [
  {
    path: 'rooms',
    component: Rooms,
  },
  {
    path: 'cabins',
    component: Cabins,
  },
  {
    path: 'tables',
    component: Tables,
  },
  {
    path: 'deliveries',
    component: Deliveries,
  },
] satisfies Route[];
