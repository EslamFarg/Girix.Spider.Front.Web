import { Route } from '@angular/router';
import { Users } from './users/users';
import { AddUser } from './add-user/add-user';
import { EditUser } from './edit-user/edit-user';
 

export default [
  {
    path: '',
    pathMatch:"full",
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
] satisfies Route[];
