import { AuthService } from '@/features/auth/services/auth-service';
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
    message?: string;
    errors?: ErrorItem[];
  };
}

export interface ErrorItem {
  property: string;
  detail: string;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const layoutService = inject(LayoutService);
  const authService = inject(AuthService);
  return next(req).pipe(
    catchError((errorResponse: IApiError) => {
      if (errorResponse.status === 401) authService.logout();
      let errorMessage =
        errorResponse?.error?.message ||
        errorResponse?.error?.detail ||
        errorResponse?.error?.title ||
        'لا يمكن اتمام العملية';

      const erros = errorResponse?.error?.errors ?? [];

      if (Array.isArray(erros) && erros.length > 0) {
        if (erros[0]?.detail) {
          errorMessage = erros[0]?.detail;
        }
      }

      layoutService.messageService.add({
        severity: 'error',
        // summary: 'خطأ',
        detail: errorMessage,
      });
      throw errorResponse.error;
    }),
  );
};
