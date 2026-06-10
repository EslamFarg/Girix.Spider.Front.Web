import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../../shared/ui/loading/services/loading';
import { finalize } from 'rxjs';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService=inject(LoadingService);
  const token = JSON.parse(localStorage.getItem('payloadUser')!);
    const skipLoading = req.headers.has('skip-loading');


  let authReq=req;

  if(token){
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token.token}`),
    });
  }
   if (!skipLoading) {
    // loadingService.show();
    Promise.resolve().then(() => {
    loadingService.show();
  });
  }

  return next(req).pipe(
    finalize(() => {
       if (!skipLoading) {
    loadingService.hide();
  }
   
  }));
};
