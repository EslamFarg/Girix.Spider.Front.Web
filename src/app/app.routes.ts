import { Routes } from '@angular/router';
import { dashboardRoute } from './features/dashboard/dashboard.route';

export const routes: Routes = [
    {path:'',redirectTo:'dashboard',pathMatch:'full'},
    // {path:'auth',loadComponent:()=>import('./features/auth/auth').then(m=>m.Auth)},
      {
    path: 'auth',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout')
        .then(m => m.AuthLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/auth/auth')
            .then(m => m.Auth)
      }
    ]
  },


   {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout')
        .then(m => m.MainLayout),

    children: [
      ...dashboardRoute   
    ]
  }
];
