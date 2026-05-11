import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import BaseService from '@/core/services/BaseService';

export const activationGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const hasBackend = !!BaseService.getResolvedApiBaseUrl();
  const isCrmRoute = state.url.includes('/auth/crm');

  // No backend configured yet - force user to stay on CRM activation pages
  if (!hasBackend) {
    if (isCrmRoute) {
      return true;
    }
    return router.createUrlTree(['/auth/crm-login']);
  }

  // Backend is configured - don't allow access to CRM activation pages anymore
  if (isCrmRoute) {
    return router.createUrlTree(['/auth/login']);
  }

  return true;
};
