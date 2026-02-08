import { BaseCrudService } from '@/core/services/BaseCrudService';
import BaseService from '@/core/services/BaseService';
import { SearchableMixin, SearchColumEnum } from '@/core/services/interfaces';
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
export class RefundService extends SearchableMixin(BaseCrudService<any, any, any>)<any, RefundSearchEnum>() {
  override apiRoute = 'Order';
}
