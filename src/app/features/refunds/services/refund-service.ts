import { BaseCrudService } from '@/core/services/BaseCrudService';
import { BaseSearchAndCrudService, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';
import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import { IOrderLatestUpdateResponse, IRefundSearchResponseValue } from './refund-types/response';
import { IRefundCreateItem, IRefundCreateRequest, IRefundUpdateRequest } from './refund-types/request';
//Id,InvoiceNumber,ReferenceNumber,Name
export enum RefundSearchEnum {
  Id = SearchColumEnum.Id,
  InvoiceNumber = SearchColumEnum.InvoiceNumber,
  ReferenceNumber = SearchColumEnum.ReferenceNumber,
  Name = SearchColumEnum.Name,
}

@Injectable({
  providedIn: 'root',
})
export class RefundService extends BaseSearchAndCrudService<
  IRefundSearchResponseValue,
  RefundSearchEnum,
  IRefundCreateRequest,
  IRefundUpdateRequest,
  any
> {
  override apiRoute = 'OrderReturn';

  constructor() {
    super();
    this.patchEndpoints({ getById: '', put: 'Update' });
  }

  ///v1/OrderReturn/order/{orderMasterId}/remaining
  getOrderLatestUpdate(orderId: number) {
    return this.http.get<IOrderLatestUpdateResponse>(`${this.apiUrl}/order/${orderId}/remaining`);
  }
}
