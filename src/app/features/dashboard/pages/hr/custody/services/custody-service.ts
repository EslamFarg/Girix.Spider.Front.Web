import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';
import {
  AssignCustodyToEmployeeModel,
  CustodyByIdResponse,
  CustodyCreateModel,
  CustodyListResponse,
  CustodyMutationResponse,
  CustodySearchModel,
  CustodyUpdateModel,
} from '../models/custody';

@Injectable({
  providedIn: 'root',
})
export class CustodyService extends BasehttpService {
  private readonly assignEndpoint = 'api/Custody/AssignCustodyToEmployee';

  constructor() {
    super('', {
      create: 'api/Custody/Create',
      update: 'api/Custody/Update',
      getAll: 'api/Custody/GetAll',
      getById: 'api/Custody/GetById',
      delete: 'api/Custody/Delete',
      search: 'api/Custody/Search',
    });
  }

  createCustody(data: CustodyCreateModel): Observable<CustodyMutationResponse> {
    return this.http.post<CustodyMutationResponse>(
      `${this.baseUrl}/${this.endPoints.create}`,
      data
    );
  }

  updateCustody(data: CustodyUpdateModel): Observable<CustodyMutationResponse> {
    return this.http.put<CustodyMutationResponse>(
      `${this.baseUrl}/${this.endPoints.update}`,
      data
    );
  }

  getCustodyById(id: number): Observable<CustodyByIdResponse> {
    return this.http.get<CustodyByIdResponse>(
      `${this.baseUrl}/${this.endPoints.getById}/${id}`
    );
  }

  getAllCustody(pageIndex: number, pageSize: number): Observable<CustodyListResponse> {
    return this.http.get<CustodyListResponse>(
      `${this.baseUrl}/${this.endPoints.getAll}?PageIndex=${pageIndex}&PageSize=${pageSize}`
    );
  }

  getAllCustodyOptions(): Observable<CustodyListResponse> {
    return this.http.get<CustodyListResponse>(`${this.baseUrl}/${this.endPoints.getAll}`);
  }

  searchCustody(data: CustodySearchModel): Observable<CustodyListResponse> {
    return this.http.post<CustodyListResponse>(
      `${this.baseUrl}/${this.endPoints.search}`,
      data
    );
  }

  deleteCustody(id: number): Observable<CustodyMutationResponse> {
    return this.http.delete<CustodyMutationResponse>(
      `${this.baseUrl}/${this.endPoints.delete}/${id}`
    );
  }

  assignCustodyToEmployee(
    data: AssignCustodyToEmployeeModel
  ): Observable<CustodyMutationResponse> {
    return this.http.put<CustodyMutationResponse>(
      `${this.baseUrl}/${this.assignEndpoint}`,
      data
    );
  }
}
