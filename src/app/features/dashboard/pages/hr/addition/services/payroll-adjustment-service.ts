import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';
import {
  PayrollAdjustmentCreateModel,
  PayrollAdjustmentListResponse,
  PayrollAdjustmentMutationResponse,
  PayrollAdjustmentUpdateModel,
} from '../models/payroll-adjustment';

@Injectable({
  providedIn: 'root',
})
export class PayrollAdjustmentService extends BasehttpService {
  private readonly getAllByEmployeeEndpoint = 'api/PayrollAdjustment/GetAllByEmployee';

  constructor() {
    super('', {
      create: 'api/PayrollAdjustment/Create',
      update: 'api/PayrollAdjustment/Update',
      delete: 'api/PayrollAdjustment/Delete',
    });
  }

  getAllByEmployee(employeeId: number): Observable<PayrollAdjustmentListResponse> {
    return this.http.get<PayrollAdjustmentListResponse>(
      `${this.baseUrl}/${this.getAllByEmployeeEndpoint}/${employeeId}`
    );
  }

  createPayrollAdjustment(
    data: PayrollAdjustmentCreateModel
  ): Observable<PayrollAdjustmentMutationResponse> {
    return this.http.post<PayrollAdjustmentMutationResponse>(
      `${this.baseUrl}/${this.endPoints.create}`,
      data
    );
  }

  updatePayrollAdjustment(
    data: PayrollAdjustmentUpdateModel
  ): Observable<PayrollAdjustmentMutationResponse> {
    return this.http.put<PayrollAdjustmentMutationResponse>(
      `${this.baseUrl}/${this.endPoints.update}`,
      data
    );
  }

  deletePayrollAdjustment(id: number): Observable<PayrollAdjustmentMutationResponse> {
    return this.http.delete<PayrollAdjustmentMutationResponse>(
      `${this.baseUrl}/${this.endPoints.delete}/${id}`
    );
  }
}
