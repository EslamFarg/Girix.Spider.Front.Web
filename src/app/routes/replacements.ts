import { Route } from '@angular/router';
import { Rooms } from '@/features/replacements/pages/rooms/rooms';
import { Huts } from '@/features/replacements/pages/huts/huts';
import { Tables } from '@/features/replacements/pages/tables/tables';
import { RepalcementsLayout } from '@/features/replacements/layouts/repalcements-layout/repalcements-layout';

export default [
  {
    path: '',
    component: RepalcementsLayout,
    children: [
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
       
    ],
  },
] satisfies Route[];
