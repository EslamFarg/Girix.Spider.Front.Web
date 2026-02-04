import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import { IPaymentVoucherGetListRequest, IPaymentVoucherGetListResponse } from './payment-voucher-types';

@Injectable({
  providedIn: 'root',
})
export class PaymentVoucherService extends BaseService<
  any,
  any,
  any,
  any,
  any
> {
  override apiRoute = 'PaymentVoucher';

 

  getList(dto: IPaymentVoucherGetListRequest) {
    return this.http.post<IPaymentVoucherGetListResponse>(`${this.apiUrl}/GetList`, dto);
  }
}
