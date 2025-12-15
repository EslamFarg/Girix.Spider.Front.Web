import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const authRoutes = ['login', 'register'];

  if (authRoutes.includes(state.url.slice(1)) && authService.isAuthenticated()) return false;

  console.log('isAuthenticatedGuard: true');
  return true;
};
