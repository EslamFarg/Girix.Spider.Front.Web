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
      // {
      //   path: 'products',
      //   loadChildren: () =>
      //     import('@/features/products/pages/product-routes').then((m) => m.default),
      // },
    ],
  },
  {
    path: '',
    component:AuthLayout,
    children: authRoutes,
    canActivate: [isAuthenticatedGuard],
  },
];
