import { Route } from '@angular/router';
 
import { Tables } from './tables/tables';
import { Rooms } from './rooms/rooms';
import { Cabins } from './cabins/cabins';

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
    path: 'cabins',
    component: Cabins,
  },
] satisfies Route[];
