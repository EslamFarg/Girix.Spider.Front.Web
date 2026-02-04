import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import { IReceiptVoucherGetListRequest, IReceiptVoucherGetListResponse } from './receipt-voucher-types';

@Injectable({
  providedIn: 'root',
})
export class ReceiptVoucherService extends BaseService<any, any, any, any, any> {
  override apiRoute = 'ReceiptVoucher';
  

  getList(dto: IReceiptVoucherGetListRequest) {
    return this.http.post<IReceiptVoucherGetListResponse>(`${this.apiUrl}/GetList`, dto);
  }
}
