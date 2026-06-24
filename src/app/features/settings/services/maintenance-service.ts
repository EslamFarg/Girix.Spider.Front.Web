import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import { Observable, Subject, tap, finalize } from 'rxjs';
import {
  IRunMaintenanceActionsRequest,
  MaintenanceActionEnum,
  toMaintenanceActionIds,
} from '../types/maintenance.types';

@Injectable({ providedIn: 'root' })
export class MaintenanceService extends BaseService {
  override apiRoute = 'Maintenance';

  /** Emitted after successful maintenance when delivery data was reset (action id 7). */
  deliveryReset$ = new Subject<void>();

  runActions(selected: Iterable<MaintenanceActionEnum>, password: string): Observable<unknown> {
    const actions = Array.from(selected);
    const request: IRunMaintenanceActionsRequest = {
      actions: toMaintenanceActionIds(actions),
      confirm: true,
      password,
    };
    this.loadingService.addLoading();
    return this.http.post(`${this.apiUrl}/run-actions`, request).pipe(
      tap(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تم تنفيذ عمليات الصيانة بنجاح.',
        });
        if (actions.includes('delivery')) {
          this.deliveryReset$.next();
        }
      }),
      finalize(() => this.loadingService.removeLoading()),
    );
  }
}
