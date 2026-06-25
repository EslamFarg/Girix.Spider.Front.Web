import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ToastrServices } from '../../shared/ui/toastr/services/toastr';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';

// export const errorInterceptor: HttpInterceptorFn = (req, next) => {

//     const messageService = inject(MessageService);
//   return next(req).pipe(
//     catchError((error: HttpErrorResponse) => {

//       let message = 'حدث خطأ ما يرجى المحاولة في وقت لاحق';

//       // ✔️ حالة validation errors
//   //     if (error.error?.errors && Array.isArray(error.error.errors)) {

//   //       error.error.errors.forEach((err: any,index:number) => {
//   //          setTimeout(() => {
//   //   messageService.add({
//   //     severity: 'error',
//   //     summary: 'خطأ في البيانات',
//   //     detail: err.message || 'خطأ في البيانات',
//   //     life: 3000
//   //   });
//   // }, index * 300)
//   //       });

//   //       return throwError(() => error);
//   //     }

//   if (error.error?.errors) {

//   const errors = error.error.errors;

//   if (Array.isArray(errors)) {
//     errors.forEach((err: any, index: number) => {
//       setTimeout(() => {
//         messageService.add({
//           severity: 'error',
//           summary: 'خطأ في البيانات',
//           detail: err.message || 'خطأ في البيانات',
//           life: 3000
//         });
//       }, index * 300);
//     });
//   } else {
//     Object.values(errors).forEach((err: any, index: number) => {
//       setTimeout(() => {
//         messageService.add({
//           severity: 'error',
//           summary: 'خطأ في البيانات',
//           detail: Array.isArray(err) ? err[0] : err,
//           life: 3000
//         });
//       }, index * 300);
//     });
//   }

//   return throwError(() => error);
// }

//       // // ✔️ باقي الحالات
//       // if (error.status === 0) {
//       //   message = 'لا يوجد اتصال بالانترنت يرجى التحقق من الاتصال';
//       // } 
//       // else if (error.status === 401) {
//       //   message = 'غير مصرح لك';
//       // } 
//       // else if (error.status === 403) {
//       //   message = 'ليس لديك صلاحية';
//       // } 
//       // else if (error.status === 404) {
//       //   message = 'يرجى التحقق من الرابط';
//       // } 
//       // else if (error.status === 500) {
//       //   message = 'خطأ في السيرفر';
//       // }


//       // return throwError(() => error);
//     })
//   );
// };

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.error?.errors) {
        const errors = error.error.errors;

        if (Array.isArray(errors)) {
          errors.forEach((err: any, index: number) => {
            setTimeout(() => {
              messageService.add({
                severity: 'error',
                summary: 'خطأ في البيانات',
                detail: err.message || 'خطأ في البيانات',
                life: 3000
              });
            }, index * 300);
          });
        } else {
          Object.values(errors).forEach((err: any, index: number) => {
            setTimeout(() => {
              messageService.add({
                severity: 'error',
                summary: 'خطأ في البيانات',
                detail: Array.isArray(err) ? err[0] : err,
                life: 3000
              });
            }, index * 300);
          });
        }

      } else {
        let message = 'حدث خطأ ما يرجى المحاولة في وقت لاحق';

        if (error.status === 0) {
          message = 'لا يوجد اتصال بالانترنت';
        } else if (error.status === 401) {
          message = 'غير مصرح لك';
        } else if (error.status === 403) {
          message = 'ليس لديك صلاحية';
        } else if (error.status === 404) {
          message = 'يرجى التحقق من الرابط';
        } else if (error.status === 500) {
          message = 'خطأ في السيرفر';
        }

        messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: message,
          life: 3000
        });
      }

      return throwError(() => error);
    })
  );
};