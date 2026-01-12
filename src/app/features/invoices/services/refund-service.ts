import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
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
export class RefundService extends BaseService<RefundSearchEnum, any,any,any,any> {
  override apiRoute = 'Order';

  
}
