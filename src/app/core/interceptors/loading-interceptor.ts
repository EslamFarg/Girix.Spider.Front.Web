import { LayoutService } from '@/layouts/services/layout-service';
import { LoadingService } from '@/yn-ng/services/loading-service';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const layoutService = inject(LoadingService);
  layoutService.addLoading();
  return next(req).pipe(finalize(() => layoutService.removeLoading()));
};
