import { Route } from '@angular/router';
 
import { Tables } from './tables/tables';
import { Rooms } from './rooms/rooms';
import { Huts } from './huts/huts';

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
