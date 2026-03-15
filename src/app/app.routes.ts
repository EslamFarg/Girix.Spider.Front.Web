import { Routes } from '@angular/router';
import { MainLayout } from '@/layouts/main-layout/main-layout';
import authRoutes from '@/routes/auth';
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
        loadChildren: () => import('@/routes/cashier').then((m) => m.default),
      },
      {
        path: 'invoices',
        loadChildren: () => import('@/routes/invoices').then((m) => m.default),
      },
      {
        path: 'classes',
        loadChildren: () => import('@/routes/classes').then((m) => m.default),
      },
      {
        path: 'restaurant',
        loadChildren: () => import('@/routes/restaurant').then((m) => m.default),
      },
      {
        path: 'storage',
        loadChildren: () => import('@/routes/storage').then((m) => m.default),
      },
      {
        path: 'replacements',
        loadChildren: () => import('@/routes/replacements').then((m) => m.default),
      },
      {
        path: 'customers',
        loadChildren: () => import('@/routes/customers').then((m) => m.default),
      },
      {
        path: 'collections',
        loadChildren: () => import('@/routes/collections').then((m) => m.default),
      },
      {
        path: 'accounts',
        loadChildren: () => import('@/routes/accounts').then((m) => m.default),
      },
      {
        path: 'deliveries',
        loadChildren: () => import('@/routes/deliveries').then((m) => m.default),
      },
      {
        path: 'users',
        loadChildren: () => import('@/routes/users').then((m) => m.default),
      },
      {
        path: 'settings',
        loadChildren: () => import('@/routes/settings').then((m) => m.default),
      },
      {
        path: 'daily-journal',
        loadChildren: () => import('@/routes/daily-journal').then((m) => m.default),
      },
      {
        path: 'app-info',
        loadChildren: () => import('@/routes/app-info').then((m) => m.default),
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayout,
    children: authRoutes,
    canActivate: [isAuthenticatedGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
