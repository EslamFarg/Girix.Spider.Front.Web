import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';
import {
  ApiResponse,
  DamageRequestByIdResponse,
  DamageRequestCreateModel,
  DamageRequestListResponse,
  DamageRequestMutationResponse,
  DamageRequestNextNoResponse,
  DamageRequestSearchModel,
  DamageRequestUpdateModel,
} from '../models/damage-request';

@Injectable({
  providedIn: 'root',
})
export class DamageRequestsService extends BasehttpService {
  private readonly approveEndpoint = 'api/DamageRequests/Approve';
  private readonly cancelEndpoint = 'api/DamageRequests/Cancel';
  private readonly getNextNoEndpoint = 'api/DamageRequests/GetNextNo';

  constructor() {
    super('', {
      create: 'api/DamageRequests/Create',
      update: 'api/DamageRequests/Update',
      getAll: 'api/DamageRequests/GetAll',
      getById: 'api/DamageRequests/GetById',
      delete: 'api/DamageRequests/Delete',
      search: 'api/DamageRequests/Search',
    });
  }

  createDamageRequest(
    data: DamageRequestCreateModel
  ): Observable<DamageRequestMutationResponse> {
    return this.http.post<DamageRequestMutationResponse>(
      `${this.baseUrl}/${this.endPoints.create}`,
      data
    );
  }

  updateDamageRequest(
    data: DamageRequestUpdateModel
  ): Observable<DamageRequestMutationResponse> {
    return this.http.put<DamageRequestMutationResponse>(
      `${this.baseUrl}/${this.endPoints.update}`,
      data
    );
  }

  getDamageRequestById(id: number): Observable<DamageRequestByIdResponse> {
    return this.http.get<DamageRequestByIdResponse>(
      `${this.baseUrl}/${this.endPoints.getById}?id=${id}`
    );
  }

  getAllDamageRequests(
    pageIndex: number,
    pageSize: number
  ): Observable<DamageRequestListResponse> {
    return this.http.get<DamageRequestListResponse>(
      `${this.baseUrl}/${this.endPoints.getAll}?PageIndex=${pageIndex}&PageSize=${pageSize}`
    );
  }

  searchDamageRequests(
    data: DamageRequestSearchModel
  ): Observable<DamageRequestListResponse> {
    return this.http.post<DamageRequestListResponse>(
      `${this.baseUrl}/${this.endPoints.search}`,
      data
    );
  }

  deleteDamageRequest(id: number): Observable<DamageRequestMutationResponse> {
    return this.http.delete<DamageRequestMutationResponse>(
      `${this.baseUrl}/${this.endPoints.delete}/${id}`
    );
  }

  getNextNo(): Observable<DamageRequestNextNoResponse> {
    return this.http.get<DamageRequestNextNoResponse>(
      `${this.baseUrl}/${this.getNextNoEndpoint}`
    );
  }

  approveDamageRequest(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${this.baseUrl}/${this.approveEndpoint}/${id}`,
      {}
    );
  }

  cancelDamageRequest(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${this.baseUrl}/${this.cancelEndpoint}/${id}`,
      {}
    );
  }
}
