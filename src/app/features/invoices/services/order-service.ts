import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export enum OrderSearchEnum {
  Id = SearchColumEnum.Id,
  OrderNumber = SearchColumEnum.OrderNumber,
  OrderType = SearchColumEnum.OrderType,
  CustomerName = SearchColumEnum.CustomerName,
  OrderPlace = SearchColumEnum.OrderPlace,
}

export interface IOrderRowResponse {
  id: number;
  orderNumber: string;
  orderType: number;
  paymentType: number;
  customerId: number;
  customerName: any;
  customerPhone: any;
  customerSecondaryPhone: any;
  customerAdress: any;
  deliveryId: any;
  placeType: number;
  placeRefId: number;
  priceForPlace: number;
  createdAt: string;
  netOrder: number;
  isCollected: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService extends BaseService<OrderSearchEnum, IOrderRowResponse> {
  override apiRoute = 'Order';


  
}
