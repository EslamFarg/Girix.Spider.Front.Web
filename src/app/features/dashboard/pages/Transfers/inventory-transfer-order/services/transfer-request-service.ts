import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';
import {
  ApiResponse,
  TransferProductLookup,
  TransferProductSearchItem,
} from '../models/transfer-request';

@Injectable({
  providedIn: 'root',
})
export class TransferRequestService extends BasehttpService {
  private readonly lookupByCodeEndpoint = 'api/TransferRequest/lookup-by-code';
  private readonly searchByNameEndpoint = 'api/TransferRequest/search-by-name';
  private readonly lookupByIdEndpoint = 'api/TransferRequest/lookup-by-id';
  private readonly updateTransferRequestEndpoint = '/api/TransferRequest';
  

  constructor() {
    super('', {
      create: 'api/TransferRequest',
      update: 'api/TransferRequest',
      getById: 'api/TransferRequest',
      delete: 'api/TransferRequest',
      search: 'api/TransferRequest/search',
      getAll: 'api/TransferRequest/list',
    });
  }

  lookupByCode(code: string): Observable<ApiResponse<TransferProductLookup>> {
    return this.http.get<ApiResponse<TransferProductLookup>>(
      `${this.baseUrl}/${this.lookupByCodeEndpoint}/${encodeURIComponent(code)}`,
      { headers: { 'skip-loading': 'true' } },
    );
  }

  searchByName(name: string): Observable<TransferProductSearchItem[] | ApiResponse<TransferProductSearchItem[]>> {
    return this.http.get<TransferProductSearchItem[] | ApiResponse<TransferProductSearchItem[]>>(
      `${this.baseUrl}/${this.searchByNameEndpoint}/${encodeURIComponent(name)}`,
      { headers: { 'skip-loading': 'true' } },
    );
  }

  lookupById(productId: number): Observable<ApiResponse<TransferProductLookup>> {
    return this.http.get<ApiResponse<TransferProductLookup>>(
      `${this.baseUrl}/${this.lookupByIdEndpoint}/${productId}`,
      { headers: { 'skip-loading': 'true' } },
    );
  }


  searchByCode(code: string){
    return this.http.get(
      `${this.baseUrl}/${this.lookupByCodeEndpoint}/${encodeURIComponent(code)}`,
      // { headers: { 'skip-loading': 'true' } },
    );
  }

  updateTransferRequest(transferRequest:any,id:number){
    return this.http.put(
      `${this.baseUrl}/${this.updateTransferRequestEndpoint}/${id}`,
      transferRequest,
      // { headers: { 'skip-loading': 'true' } },
    );
  }

  getSenderReview(id: number) {
    return this.http.get(`${this.baseUrl}/api/TransferRequest/${id}/sender-review`);
  }

  getReceiverReview(id: number) {
    return this.http.get(`${this.baseUrl}/api/TransferRequest/${id}/receiver-review`);
  }

  senderApprove(id: number, payload: { id: number; lines: unknown[] }) {
    return this.http.post(
      `${this.baseUrl}/api/TransferRequest/${id}/sender-approve`,
      payload,
    );
  }

  senderReject(id: number) {
    return this.http.post(
      `${this.baseUrl}/api/TransferRequest/${id}/sender-reject`,
      {},
    );
  }

  receiverConfirm(id: number) {
    return this.http.post(
      `${this.baseUrl}/api/TransferRequest/${id}/receiver-confirm`,
      {},
    );
  }

  receiverReject(
    id: number,
    payload: {
      id: number;
      rejectionReasons?: string[];
      otherReason?: string | null;
    },
  ) {
    return this.http.post(
      `${this.baseUrl}/api/TransferRequest/${id}/receiver-reject`,
      payload,
    );
  }
  // createTransferRequest(transferRequest:any){
  //   return this.http.post(
  //     `${this.baseUrl}/${this.createTransferRequestEndpoint}`,
  //     transferRequest,
  //     // { headers: { 'skip-loading': 'true' } },
  //   );
  // }

  getAllListTransferRequest(enumViewType: any,pageIndex: number, pageSize: number){
    return this.http.post(`${this.baseUrl}/api/TransferRequest/Filter`,{
      
        viewType: enumViewType,
        // code: string,
        pagination: {
          pageIndex: pageIndex,
          pageSize: pageSize
        }
      
    });
  }
}
