import { BaseCrudService } from '@/core/services/BaseCrudService';
import { BaseSearchAndCrudService, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';
import BaseService from '@/core/services/BaseService';
 import { Injectable } from '@angular/core';

export enum RefundSearchEnum {
  Id = SearchColumEnum.Id,
  OrderNumber = SearchColumEnum.OrderNumber,
  OrderType = SearchColumEnum.OrderType,
  CustomerName = SearchColumEnum.CustomerName,
  OrderPlace = SearchColumEnum.OrderPlace,
}

@Injectable({
  providedIn: 'root',
})
export class RefundService extends BaseSearchAndCrudService<any, RefundSearchEnum,any, any, any> {
  override apiRoute = 'Order';
}
