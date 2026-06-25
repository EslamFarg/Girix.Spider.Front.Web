import { Routes } from '@angular/router';
import { dashboardRoute } from './features/dashboard/dashboard.route';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
    {path:'',redirectTo:'dashboard',pathMatch:'full'},
    {
    path: 'auth',
    canActivate:[guestGuard],
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
    canActivate:[authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout')
        .then(m => m.MainLayout),

    children: [
      ...dashboardRoute   
    ]
  }
];
