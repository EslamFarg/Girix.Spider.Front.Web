import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import { ICustomerCreateRequest, ICustomerReadResponse, ICustomerSearchResponseValue, ICustomerUpdateRequest } from './customer-types';
//Customer : Id,Name,PhoneNumber,IsCompany

export enum CustomerSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  PhoneNumber = SearchColumEnum.PhoneNumber,
  IsCompany = SearchColumEnum.IsCompany,
}



@Injectable({
  providedIn: 'root',
})
export class CustomerService extends BaseService<
  CustomerSearchEnum,
  ICustomerCreateRequest,
  ICustomerUpdateRequest,
  ICustomerReadResponse,
  ICustomerSearchResponseValue
> {
  override apiRoute = 'Customer';


  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({
      update: 'Update',
    })
  }
}
