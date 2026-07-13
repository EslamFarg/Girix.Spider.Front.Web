import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';
import {
  CreateSalaryPostingModel,
  PayrollEmployeesListResponse,
  PayrollEmployeesQuery,
  SalaryPostingByIdResponse,
  SalaryPostingListResponse,
  SalaryPostingMutationResponse,
  SalaryPostingSearchModel,
  UpdateSalaryPostingModel,
} from '../models/proof-of-salary';

@Injectable({
  providedIn: 'root',
})
export class ProofService extends BasehttpService {
  private readonly getPayrollEmployeesEndpoint = 'api/SalaryPostings/GetPayrollEmployees';

  constructor() {
    super('', {
      create: 'api/SalaryPostings',
      update: 'api/SalaryPostings',
      getAll: 'api/SalaryPostings/GetAll',
      getById: 'api/SalaryPostings/GetById',
      delete: 'api/SalaryPostings/Delete',
      search: 'api/SalaryPostings/Search',
    });
  }

  getPayrollEmployees(
    query: PayrollEmployeesQuery
  ): Observable<PayrollEmployeesListResponse> {
    const params = new URLSearchParams({
      month: query.month,
      year: query.year,
    });

    if (query.departmentId != null) {
      params.set('departmentId', String(query.departmentId));
    }

    return this.http.get<PayrollEmployeesListResponse>(
      `${this.baseUrl}/${this.getPayrollEmployeesEndpoint}?${params.toString()}`
    );
  }

  getAllSalaryPostings(
    pageIndex: number,
    pageSize: number
  ): Observable<SalaryPostingListResponse> {
    return this.http.get<SalaryPostingListResponse>(
      `${this.baseUrl}/${this.endPoints.getAll}?PageIndex=${pageIndex}&PageSize=${pageSize}`
    );
  }

  searchSalaryPostings(
    data: SalaryPostingSearchModel
  ): Observable<SalaryPostingListResponse> {
    return this.http.post<SalaryPostingListResponse>(
      `${this.baseUrl}/${this.endPoints.search}`,
      data,
    
    );
  }

  getSalaryPostingById(id: number): Observable<SalaryPostingByIdResponse> {
    return this.http.get<SalaryPostingByIdResponse>(
      `${this.baseUrl}/${this.endPoints.getById}?id=${id}`
    );
  }

  createSalaryPosting(
    data: CreateSalaryPostingModel
  ): Observable<SalaryPostingMutationResponse> {
    return this.http.post<SalaryPostingMutationResponse>(
      `${this.baseUrl}/${this.endPoints.create}`,
      data
    );
  }

  updateSalaryPosting(
    data: UpdateSalaryPostingModel
  ): Observable<SalaryPostingMutationResponse> {
    return this.http.put<SalaryPostingMutationResponse>(
      `${this.baseUrl}/${this.endPoints.update}`,
      data
    );
  }

  deleteSalaryPosting(id: number): Observable<SalaryPostingMutationResponse> {
    return this.http.delete<SalaryPostingMutationResponse>(
      `${this.baseUrl}/${this.endPoints.delete}/${id}`
    );
  }
}
