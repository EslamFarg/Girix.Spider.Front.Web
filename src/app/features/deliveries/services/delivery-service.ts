import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export interface IDeliveryRowResponse {
  id: number;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  orderNumber: number;
}

export interface IDeliverySearchResponseValue {
  rows: IDeliveryRowResponse[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}

//MenuItems : Id,Name,PhoneNumber

export enum DeliverySearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  PhoneNumber = SearchColumEnum.PhoneNumber,
}

@Injectable({
  providedIn: 'root',
})
export class DeliveryService extends BaseService<DeliverySearchEnum, any, any, any, IDeliverySearchResponseValue> {
  override apiRoute = 'Delivery';
}
