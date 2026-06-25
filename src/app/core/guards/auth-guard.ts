import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServices } from '../../features/auth/services/auth-services';
export const authGuard: CanActivateFn = (route, state) => {
  const authServices = inject(AuthServices);

  if(authServices.isLoggedIn()){
    return true;
  }
  
  authServices.logout();
  return false;
  
};
