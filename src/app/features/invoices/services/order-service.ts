import { BaseCrudService } from '@/core/services/BaseCrudService';
import { BaseSearchAndCrudService, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';
import BaseService from '@/core/services/BaseService';
 
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
  menuItemId: number | null;
  mealId: number | null;
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

//gey by id

export interface IOrderReadResponse {
  id: number;
  orderNumber: string;
  orderType: number;
  paymentType: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerSecondaryPhone: string;
  customerAdress: string;
  deliveryId: any;
  deliveryFee: number;
  deliveryFeeTax: number;
  placeType: number;
  placeRefId: number;
  durationMinutes: any;
  priceForPlace: number;
  placeTax: number;
  createdAt: string;
  discountType: number;
  discountPercentage: number;
  discountValue: number;
  totalSelectiveTax: number;
  totalTaxForItems: number;
  serviceFee: number;
  serviceFeeTax: number;
  totalTax: number;
  totalPriceForItems: number;
  totalCostPriceForItems: number;
  netOrder: number;
  payingCash: number;
  payingNetwork: number;
  isCollected: boolean;
  items: IOrderReadItem[];
}

export interface IOrderReadItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  mealId: any;
  mealName: any;
  additionalMenuItemId: any;
  quantity: number;
  price: number;
  totalPrice: number;
  priceAfterDiscount: number;
  totalPriceAfterDiscount: number;
  totalTaxValueAfterDiscount: number;
  totalSelectiveTaxValueAfterDiscount: number;
  priceWithSelectiveTaxAndTaxAfterDiscount: number;
  totalWithSelectiveTaxAndTaxAfterDiscount: number;
}

// local place replacement
export interface ILocalPlaceChangeRequest {
  id: number;
  placeType: number;
  placeRefId: number;
  durationMinutes: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService extends BaseSearchAndCrudService<
  IOrderSearchResponseValue,
  OrderSearchEnum,
  IOrderCreateRequest,
  any,
  IOrderReadResponse
> {
  override apiRoute = 'Order';

  changeLocalPlace(dto: ILocalPlaceChangeRequest) {
    return this.http.put<any>(`${this.apiUrl}/change-place`, dto);
  }
}
