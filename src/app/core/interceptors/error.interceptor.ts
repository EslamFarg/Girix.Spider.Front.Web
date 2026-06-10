import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ToastrServices } from '../../shared/ui/toastr/services/toastr';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  //  const _toastr: ToastrServices = inject(ToastrServices);
    const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      let message = 'حدث خطأ ما يرجى المحاولة في وقت لاحق';

      // ✔️ حالة validation errors
      if (error.error?.errors && Array.isArray(error.error.errors)) {

        error.error.errors.forEach((err: any,index:number) => {
          // _toastr.show(err.message || 'خطأ في البيانات', 'error');
          // messageService.add({
          //   severity: 'error',
          //   summary: 'خطاء في البيانات',
          //   detail: err.message || 'خطاء في البيانات',
          //   sticky: true
          // })


           setTimeout(() => {
    messageService.add({
      severity: 'error',
      summary: 'خطأ في البيانات',
      detail: err.message || 'خطأ في البيانات',
      life: 3000
    });
  }, index * 300)
        });

        return throwError(() => error);
      }

      // ✔️ باقي الحالات
      if (error.status === 0) {
        message = 'لا يوجد اتصال بالانترنت يرجى التحقق من الاتصال';
      } 
      else if (error.status === 401) {
        message = 'غير مصرح لك';
      } 
      else if (error.status === 403) {
        message = 'ليس لديك صلاحية';
      } 
      else if (error.status === 404) {
        message = 'يرجى التحقق من الرابط';
      } 
      else if (error.status === 500) {
        message = 'خطأ في السيرفر';
      }

      // _toastr.show(message, 'error');

      return throwError(() => error);
    })
  );
};
