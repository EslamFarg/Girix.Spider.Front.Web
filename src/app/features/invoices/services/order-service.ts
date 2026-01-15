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
  customerName: string;
  customerPhone: string;
  customerSecondaryPhone: string;
  customerAdress: string;
  deliveryId: number;
  placeType: number;
  placeRefId: number;
  priceForPlace: number;
  createdAt: string;
  netOrder: number;
  isCollected: boolean;
  payingCash: number;
  payingNetwork: number;
}

export interface IOrderSearchResponseValue {
  rows: IOrderRowResponse[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}

export interface ICategoryRowResponse {
  id: number;
  name: string;
  printerName: string;
  isOnCasher: boolean;
  attachment: {
    id: number;
    fullPath: string;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class OrderService extends BaseService<OrderSearchEnum, any, any, IOrderSearchResponseValue> {
  override apiRoute = 'Order';
}
