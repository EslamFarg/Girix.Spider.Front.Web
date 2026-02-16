import { HttpInterceptorFn } from '@angular/common/http';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  //todo: get language from local storage and add it to the request header
  const clonedReq = req.clone({
    headers: req.headers.set('Accept-Language', 'ar'),
  });
  return next(clonedReq);
};
