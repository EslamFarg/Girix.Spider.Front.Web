import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';
import {
  CustodyReceiptByIdResponse,
  CustodyReceiptCreateModel,
  CustodyReceiptListResponse,
  CustodyReceiptMutationResponse,
  CustodyReceiptSearchModel,
  CustodyReceiptUpdateModel,
} from '../models/custody-receipt';

@Injectable({
  providedIn: 'root',
})
export class CustodyReceiptService extends BasehttpService {
  constructor() {
    super('', {
      create: 'api/CustodyReceipt/Create',
      update: 'api/CustodyReceipt/Update',
      getAll: 'api/CustodyReceipt/GetAll',
      getById: 'api/CustodyReceipt/GetById',
      delete: 'api/CustodyReceipt/Delete',
      search: 'api/CustodyReceipt/Search',
    });
  }

  createCustodyReceipt(
    data: CustodyReceiptCreateModel
  ): Observable<CustodyReceiptMutationResponse> {
    return this.http.post<CustodyReceiptMutationResponse>(
      `${this.baseUrl}/${this.endPoints.create}`,
      data
    );
  }

  updateCustodyReceipt(
    data: CustodyReceiptUpdateModel
  ): Observable<CustodyReceiptMutationResponse> {
    return this.http.put<CustodyReceiptMutationResponse>(
      `${this.baseUrl}/${this.endPoints.update}`,
      data
    );
  }

  getCustodyReceiptById(id: number): Observable<CustodyReceiptByIdResponse> {
    return this.http.get<CustodyReceiptByIdResponse>(
      `${this.baseUrl}/${this.endPoints.getById}/${id}`
    );
  }

  getAllCustodyReceipt(
    pageIndex: number,
    pageSize: number
  ): Observable<CustodyReceiptListResponse> {
    return this.http.get<CustodyReceiptListResponse>(
      `${this.baseUrl}/${this.endPoints.getAll}?PageIndex=${pageIndex}&PageSize=${pageSize}`
    );
  }

  searchCustodyReceipt(
    data: CustodyReceiptSearchModel
  ): Observable<CustodyReceiptListResponse> {
    return this.http.post<CustodyReceiptListResponse>(
      `${this.baseUrl}/${this.endPoints.search}`,
      data
    );
  }

  deleteCustodyReceipt(id: number): Observable<CustodyReceiptMutationResponse> {
    return this.http.delete<CustodyReceiptMutationResponse>(
      `${this.baseUrl}/${this.endPoints.delete}/${id}`
    );
  }
}
