import { Route } from "@angular/router";
import { Login } from "@/features/auth/pages/login/login";

 export default [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Login
  }
] satisfies Route[]