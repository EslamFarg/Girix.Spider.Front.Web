import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../../shared/ui/loading/services/loading';
import { finalize } from 'rxjs';

// export const httpInterceptor: HttpInterceptorFn = (req, next) => {
//   const loadingService=inject(LoadingService);
//   const token = JSON.parse(localStorage.getItem('erp_auth')!);
//     const skipLoading = req.headers.has('skip-loading');


//   let authReq=req;

//   if(token){
//     authReq = req.clone({
//       headers: req.headers.set('Authorization', `Bearer ${token.token}`),
//     });
//   }
//    if (!skipLoading) {
//     // loadingService.show();
//     Promise.resolve().then(() => {
//     loadingService.show();
//   });
//   }

//   return next(req).pipe(
//     finalize(() => {
//        if (!skipLoading) {
//     loadingService.hide();
//   }
   
//   }));
// };


export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  const skipLoading = req.headers.has('skip-loading');

  const auth =
    JSON.parse(localStorage.getItem('erp_auth') || 'null') ||
    JSON.parse(sessionStorage.getItem('erp_auth') || 'null');

  let authReq = req;

  if (auth?.token) {
    authReq = req.clone({
      headers: req.headers.set(
        'Authorization',
        `Bearer ${auth.token}`
      ),
    });
  }

  if (!skipLoading) {
    Promise.resolve().then(() => loadingService.show());
  }

  return next(authReq).pipe(
    finalize(() => {
      if (!skipLoading) {
        loadingService.hide();
      }
    })
  );
};