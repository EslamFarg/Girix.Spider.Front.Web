import { BaseCrudService } from '@/core/services/BaseCrudService';
import { BaseSearchAndCrudService, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';
import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import { IRefundSearchResponseValue } from './refund-types/response';
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
  any,
  any,
  any
> {
  override apiRoute = 'OrderReturn';
}
