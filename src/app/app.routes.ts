import { Routes } from '@angular/router';
import { MainLayout } from '@/layouts/main-layout/main-layout';
import authRoutes from '@/features/auth/pages/auth-routes';
import { isAuthenticatedGuard } from '@/features/auth/guards/is-authenticated-guard';
import { AuthLayout } from './layouts/auth-layout/auth-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('@/features/general/pages/general-routes').then((m) => m.default),
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
    ],
  },
  {
    path: '',
    component:AuthLayout,
    children: authRoutes,
    canActivate: [isAuthenticatedGuard],
  },
  {
    path: '**',
    redirectTo: '',    
  }
];
