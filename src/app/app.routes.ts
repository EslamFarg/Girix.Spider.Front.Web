import { Routes } from '@angular/router';
import { MainLayout } from '@/layouts/main-layout/main-layout';
import authRoutes from '@/features/auth/pages/auth-routes';
import { isAuthenticatedGuard } from '@/features/auth/guards/is-authenticated-guard';
import { AuthLayout } from './layouts/auth-layout/auth-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    canActivate: [isAuthenticatedGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('@/features/cashier/pages/general-routes').then((m) => m.default),
      },
      {
        path: 'invoices',
        loadChildren: () =>
          import('@/features/invoices/pages/invoices-routes').then((m) => m.default),
      },
      {
        path: 'classes',
        loadChildren: () =>
          import('@/features/classes/pages/classes-routes').then((m) => m.default),
      },
      {
        path: 'restaurant',
        loadChildren: () =>
          import('@/features/restaurant/pages/restaurant-routes').then((m) => m.default),
      },
      {
        path: 'storage',
        loadChildren: () =>
          import('@/features/storage/pages/storage-routes').then((m) => m.default),
      },
      {
        path: 'replacements',
        loadChildren: () =>
          import('@/features/replacements/pages/replacements-routes').then((m) => m.default),
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('@/features/customers/pages/customers-routes').then((m) => m.default),
      },
      {
        path: 'collections',
        loadChildren: () =>
          import('@/features/collections/pages/collections-routes').then((m) => m.default),
      },
      {
        path: 'accounts',
        loadChildren: () =>
          import('@/features/accounts/pages/accounts-routes').then((m) => m.default),
      },
      {
        path: 'deliveries',
        loadChildren: () =>
          import('@/features/deliveries/pages/deliveries-routes').then((m) => m.default),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('@/features/users/pages/users-routes').then((m) => m.default),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('@/features/settings/pages/settings-routes').then((m) => m.default),
      },
      {
        path: 'app-info',
        loadChildren: () =>
          import('@/features/app-info/pages/app-info-routes').then((m) => m.default),
      },
    ],
  },
  {
    path: 'auth',
    component:AuthLayout,
    children: authRoutes,
    canActivate: [isAuthenticatedGuard],
  },
  {
    path: '**',
    redirectTo: '',    
  }
];
