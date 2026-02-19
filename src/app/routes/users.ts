import { Route } from '@angular/router';
import { Users } from '@/features/users/pages/users/users';
import { AddUser } from '@/features/users/pages/add-user/add-user';
import { EditUser } from '@/features/users/pages/edit-user/edit-user';
import { UsersLayout } from '@/features/users/layouts/users-layout/users-layout';

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
