import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';
import { ApiResponse } from '../models/issue-order';

@Injectable({
  providedIn: 'root',
})
export class IssueOrderService extends BasehttpService {
  constructor() {
    super('', {
      create: 'api/IssueOrders',
      update: 'api/IssueOrders',
      delete: 'api/IssueOrders/Delete',
      getById: 'api/IssueOrders/GetById',
      getAll: 'api/IssueOrders/GetAll',
      search: 'api/IssueOrders/Search',
    });
  }

  getNextNo(): Observable<ApiResponse<string | number>> {
    return this.http.get<ApiResponse<string | number>>(
      `${this.baseUrl}/api/IssueOrders/GetNextNo`,
    );
  }

  updateIssueOrder<T>(payload: T): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(
      `${this.baseUrl}/${this.endPoints.update}`,
      payload,
    );
  }
}
