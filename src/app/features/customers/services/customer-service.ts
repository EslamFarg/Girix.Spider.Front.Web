import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
//Customer : Id,Name,PhoneNumber,IsCompany

export enum CustomerSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  PhoneNumber = SearchColumEnum.PhoneNumber,
  IsCompany = SearchColumEnum.IsCompany,
}

export interface ICustomerRowResponse {
  id: number;
  name: string;
  phoneNumber: string;
  secondaryMobileNumber: string;
  city: any;
  district: any;
  street: any;
  buildingNumber: any;
  apartment: any;
  landmark: any;
  postalCode: any;
  orderNumbers: number;
  isCompany: boolean;
}

export interface ICustomerCreateDto {
  nameAr: string;
  nameEn: string;
  phoneNumber: string;
  secondaryMobileNumber: string;
  city: string;
  district: string;
  street: string;
  buildingNumber: string;
  apartment: string;
  landmark: string;
  postalCode: string;
  isCompany: boolean;
}

export interface ICustomerUpdateDto {
  id: number;
  nameAr: string;
  nameEn: string;
  phoneNumber: string;
  secondaryMobileNumber: string;
  city: string;
  district: string;
  street: string;
  buildingNumber: string;
  apartment: string;
  landmark: string;
  postalCode: string;
  isCompany: boolean;
}

export interface ICustomerDtoResponse {
  id: number;
  name: string;
  phoneNumber: string;
  secondaryMobileNumber: string;
  city: string;
  district: string;
  street: string;
  buildingNumber: string;
  apartment: string;
  landmark: string;
  postalCode: string;
  orderNumbers: number;
  isCompany: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService extends BaseService<
  CustomerSearchEnum,
  ICustomerRowResponse,
  ICustomerCreateDto,
  ICustomerUpdateDto,
  ICustomerDtoResponse
> {
  override apiRoute = 'Customer';
}
