import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import { IReceiptVoucherGetListRequest, IReceiptVoucherGetListResponse } from '../types';
import { BaseCrudService } from '@/core/services/BaseCrudService';

@Injectable({
  providedIn: 'root',
})
export class ReceiptVoucherService extends BaseCrudService<any, any, any> {
  override apiRoute = 'ReceiptVoucher';

  getList(dto: IReceiptVoucherGetListRequest) {
    return this.http.post<IReceiptVoucherGetListResponse>(`${this.apiUrl}/GetList`, dto);
  }
}
