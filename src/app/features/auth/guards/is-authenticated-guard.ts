import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';
import BaseService from '@/core/services/BaseService';
import { MessageService } from 'primeng/api';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Logged in
  if (authService.isAuthenticated()) {
    // Prevent access to login/register
    if (state.url.startsWith('/auth')) {
      return router.createUrlTree(['/']);
    }

    const savedExpireDate = authService.get<string>('expireDate');
    const backendApiUrl = BaseService.getResolvedApiBaseUrl();
    const currentDate = new Date();
    const expireDate = savedExpireDate? new Date(savedExpireDate) : currentDate;
    console.log(expireDate);
    if (expireDate <= currentDate || !savedExpireDate) {
      authService.logout();
      authService.messageService.add({
        severity: 'error',
        summary: 'انتهت الصلاحية',
        detail: `تم انتهاء مدة تفعيل التطبيق`,
        life: 1000 * 60 * 60,
      })
      console.log('انتهت الصلاحية');
      return false;
    }
    console.log('انتهت 1الصلاحية');
    return true;
  }

  //if no backend is available
  if (!BaseService.getResolvedApiBaseUrl()) {
    //check if in crm routes
    if (state.url.includes('crm')) {
      return true;
    } else {
      return router.createUrlTree(['/auth/crm-login']);
    }
  }

  // Not logged in
  if (state.url.startsWith('/auth')) {
    return true;
  }

  // Redirect unauthenticated users to login
  return router.createUrlTree(['/auth/login']);
};
