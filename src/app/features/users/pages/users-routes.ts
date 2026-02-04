import { Route } from '@angular/router';
import { Users } from './users/users';
import { AddUser } from './add-user/add-user';
import { EditUser } from './edit-user/edit-user';
import { UsersLayout } from '../layouts/users-layout/users-layout';

export default [
  {
    path: '',
    component: UsersLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: Users,
      },
      {
        path: 'add',
        component: AddUser,
      },
      {
        path: ':id/edit',
        component: EditUser,
      },
    ],
  },
] satisfies Route[];
