import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import { IPaymentVoucherGetListRequest, IPaymentVoucherGetListResponse } from './payment-voucher-types';
import { BaseCrudService } from '@/core/services/BaseCrudService';

@Injectable({
  providedIn: 'root',
})
export class PaymentVoucherService extends BaseCrudService<any, any, any> {
  override apiRoute = 'PaymentVoucher';

  getList(dto: IPaymentVoucherGetListRequest) {
    return this.http.post<IPaymentVoucherGetListResponse>(`${this.apiUrl}/GetList`, dto);
  }
}
