import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService, IUserDetails } from '../services/auth-service';
import { inject } from '@angular/core';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.get<IUserDetails>('userDetails')?.token;
  const forgetPasswordToken = authService.get('forgotPasswordToken');
  if (token || forgetPasswordToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token ?? forgetPasswordToken ?? ''}`,
      },
    });
  }
  return next(req);
};
