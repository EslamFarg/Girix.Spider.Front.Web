import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import {
  ICustomerCreateRequest,
  ICustomerReadResponse,
  ICustomerSearchResponseValue,
  ICustomerUpdateRequest,
} from './customer-types';
import { BaseCrudService } from '@/core/services/BaseCrudService';
import { SearchableMixin, SearchColumEnum } from '@/core/services/interfaces';
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
export class CustomerService extends SearchableMixin(
  BaseCrudService<ICustomerCreateRequest, ICustomerUpdateRequest, ICustomerReadResponse>,
)<ICustomerSearchResponseValue, CustomerSearchEnum>() {
  override apiRoute = 'Customer';

  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({
      update: 'Update',
    });
  }
}
