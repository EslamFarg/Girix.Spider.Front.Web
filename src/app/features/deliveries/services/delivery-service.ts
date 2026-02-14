import { BaseCrudService } from '@/core/services/BaseCrudService';
import { BaseSearchAndCrudService, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';
import BaseService from '@/core/services/BaseService';
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
//

export interface IDeliveryCreateRequest {}

export interface IDeliveryUpdateRequest {}

export interface IDeliveryReadResponse {
  id: number;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  orderNumber: number;
  description: string;
  identityNumber: string;
  attachment: {
    id: number;
    fullPath: string;
  }[];
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
export class DeliveryService extends BaseSearchAndCrudService<
  IDeliverySearchResponseValue,
  DeliverySearchEnum,
  IDeliveryCreateRequest,
  IDeliveryUpdateRequest,
  IDeliveryReadResponse
> {
  override apiRoute = 'Delivery';
}
