import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export enum OrderSearchEnum {
  Id = SearchColumEnum.Id,
  OrderNumber = SearchColumEnum.OrderNumber,
  OrderType = SearchColumEnum.OrderType,
  CustomerName = SearchColumEnum.CustomerName,
  OrderPlace = SearchColumEnum.OrderPlace,
}
export enum OrderLocationType {
  DineIn = 1,
  Takeaway = 2,
  Delivery = 3,
}
export enum OrderPaymentType {
  Pending = 0,
  Paid = 1,
}
export enum OrderLocalType {
  Room = 1,
  Table = 2,
  Hut = 3,
}

//rows in search response

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

//search response

export interface IOrderSearchResponseValue {
  rows: IOrderRowResponse[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}

//create

export interface IOrderCreateRequest {
  orderType: OrderLocationType;
  paymentType: OrderPaymentType;
  placeType: OrderLocalType;
  placeRefId: number;
  durationMinutes: number;
  deliveryId: number;
  payingCash: number;
  payingNetwork: number;
  createAt: string;
  idempotencyKey: string;
  items: IOrderCreateItem[];
  customerRequest: IOrderCreateCustomerRequest;
}


export interface IOrderCreateItem {
  menuItemId: number;
  mealId: number;
  quantity: number;
  addons: IOrderCreateItemAddon[];
}

export interface IOrderCreateItemAddon {
  additionalMenuItemId: number;
  quantity: number;
}

export interface IOrderCreateCustomerRequest {
  id: number;
  nameAr: string;
  nameEn: string;
  phoneNumber: string;
  secondaryMobileNumber: string;
  addressDescription: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService extends BaseService<OrderSearchEnum, IOrderCreateRequest, any, IOrderSearchResponseValue> {
  override apiRoute = 'Order';
}
