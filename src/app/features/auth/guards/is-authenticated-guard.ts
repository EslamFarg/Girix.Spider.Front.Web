import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);



  // Logged in
  if (authService.isAuthenticated()) {
    // Prevent access to login/register
    if (state.url.startsWith('/auth')) {
      return router.createUrlTree(['/']);
    }
    return true;
  }

  // Not logged in
  if (state.url.startsWith('/auth')) {
    return true;
  }

  // Redirect unauthenticated users to login
  return router.createUrlTree(['/auth/login']);
};
