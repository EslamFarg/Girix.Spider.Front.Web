import { Route } from '@angular/router';
import { Tables } from '@/features/restaurant/pages/tables/tables';
import { Rooms } from '@/features/restaurant/pages/rooms/rooms';
import { Huts } from '@/features/restaurant/pages/huts/huts';

export default [
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
] satisfies Route[];
