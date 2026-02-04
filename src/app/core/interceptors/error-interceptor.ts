import { LayoutService } from '@/layouts/services/layout-service';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap } from 'rxjs';

export interface IApiError extends HttpErrorResponse {
  error: {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance: string;
    traceId: string;
    requestId: string;
    errors?: ErrorItem[];
  };
}

export interface ErrorItem {
  property: string;
  detail: string;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const layoutService = inject(LayoutService);
  return next(req).pipe(
    catchError((errorResponse: IApiError) => {
      layoutService.messageService.add({
        severity: 'error',
        // summary: 'خطأ',
        detail: errorResponse.error.detail ?? errorResponse.error.title,
      });
      throw errorResponse.error;
    })
  );
};
