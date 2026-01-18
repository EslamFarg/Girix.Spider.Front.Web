import { Route } from '@angular/router';
import { Rooms } from '@/features/replacements/pages/rooms/rooms';
import { Huts } from '@/features/replacements/pages/huts/huts';
import { Tables } from '@/features/replacements/pages/tables/tables';
import { Deliveries } from '@/features/replacements/pages/deliveries/deliveries';

export default [
  {
    path: 'rooms',
    component: Rooms,
  },
  {
    path: 'huts',
    component: Huts,
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
