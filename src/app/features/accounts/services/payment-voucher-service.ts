import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import { BaseCrudService } from '@/core/services/BaseCrudService';
import { BaseSearchAndCrudService, ISearchCriteria, SearchColumEnum } from '@/core';
import {
  IPaymentVoucherCreateRequest,
  IPaymentVoucherReadResponse,
  IPaymentVoucherSearchResponse,
  IPaymentVoucherUpdateRequest,
} from '../types';

// PaymentVoucher:id,VoucherNo
export enum PaymentVoucherSearchEnum {
  Id = SearchColumEnum.Id,
  VoucherNo = SearchColumEnum.VoucherNo,
}

@Injectable({
  providedIn: 'root',
})
export class PaymentVoucherService extends BaseSearchAndCrudService<
  any,
  PaymentVoucherSearchEnum,
  IPaymentVoucherCreateRequest,
  IPaymentVoucherUpdateRequest,
  IPaymentVoucherReadResponse
> {
  override apiRoute = 'PaymentVoucher';

  override search<T = IPaymentVoucherSearchResponse>(criteriaDto: ISearchCriteria<PaymentVoucherSearchEnum>) {
    return super.search<T>(criteriaDto);
  }
}
