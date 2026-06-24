import { AuthService } from '@/features/auth/services/auth-service';
import { LayoutService } from '@/layouts/services/layout-service';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs';

export interface IApiErrorBody {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  traceId?: string;
  requestId?: string;
  message?: string;
  errors?: ErrorItem[];
}

export interface IApiError extends HttpErrorResponse {
  error: IApiErrorBody | string;
}

export interface ErrorItem {
  property: string;
  detail: string;
}

const backendErrorMessages: Record<string, string> = {
  'DailyJournalPeriod.NotOpened': 'اليومية غير مفتوحة، يرجى فتح اليومية أولاً.',
};

/** Prefer localized ProblemDetails.detail from backend over generic/code fields. */
export function resolveApiErrorMessage(errorResponse: HttpErrorResponse): string {
  const body = errorResponse.error;

  if (typeof body === 'string' && body.trim()) {
    return body.trim();
  }

  if (!body || typeof body !== 'object') {
    return errorResponse.message || 'لا يمكن اتمام العملية';
  }

  const apiBody = body as IApiErrorBody;

  const validationDetail = apiBody.errors?.find((item) => item.detail?.trim())?.detail?.trim();
  if (validationDetail) {
    return mapKnownErrorCode(validationDetail);
  }

  const detail = apiBody.detail?.trim();
  if (detail) {
    return mapKnownErrorCode(detail);
  }

  const message = apiBody.message?.trim();
  if (message && !looksLikeErrorCode(message)) {
    return mapKnownErrorCode(message);
  }

  const title = apiBody.title?.trim();
  if (title) {
    return mapKnownErrorCode(title);
  }

  if (message) {
    return mapKnownErrorCode(message);
  }

  return 'لا يمكن اتمام العملية';
}

export function resolveApiErrorSummary(errorResponse: HttpErrorResponse): string {
  const body = errorResponse.error;
  if (body && typeof body === 'object') {
    const title = (body as IApiErrorBody).title?.trim();
    if (title) {
      return title;
    }
  }
  return errorResponse.status?.toString() ?? 'خطأ';
}

function mapKnownErrorCode(message: string): string {
  return backendErrorMessages[message] ?? message;
}

function looksLikeErrorCode(value: string): boolean {
  return /^[A-Z][A-Za-z0-9]*(\.[A-Za-z0-9]+)+$/.test(value);
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const layoutService = inject(LayoutService);
  const authService = inject(AuthService);
  return next(req).pipe(
    catchError((errorResponse: IApiError) => {
      if (errorResponse.status === 401) authService.logout();

      const errorMessage = resolveApiErrorMessage(errorResponse);

      layoutService.messageService.add({
        severity: 'error',
        summary: resolveApiErrorSummary(errorResponse),
        detail: errorMessage,
      });
      throw errorResponse;
    }),
  );
};
