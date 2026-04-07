import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import { IReceiptVoucherReadResponse, IReceiptVoucherSearchResponse } from '../types';
import { BaseSearchAndCrudService, ISearchCriteria, SearchColumEnum } from '@/core';
import { IReceiptVoucherCreateRequest, IReceiptVoucherUpdateRequest } from '../types/receipt-voucher/api/requests';

//JournalEntry: id,VoucherNo
export enum ReceiptVoucherSearchEnum {
  Id = SearchColumEnum.Id,
  VoucherNo = SearchColumEnum.VoucherNo,
}

@Injectable({
  providedIn: 'root',
})
export class ReceiptVoucherService extends BaseSearchAndCrudService<
  any,
  ReceiptVoucherSearchEnum,
  IReceiptVoucherCreateRequest,
  IReceiptVoucherUpdateRequest,
  IReceiptVoucherReadResponse
> {
  override apiRoute = 'ReceiptVoucher';

  override search<T = IReceiptVoucherSearchResponse>(criteriaDto: ISearchCriteria<ReceiptVoucherSearchEnum>) {
    return super.search<T>(criteriaDto);
  }
}
