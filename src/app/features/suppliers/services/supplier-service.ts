import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import {
  ISupplierCreateRequest,
  ISupplierReadResponse,
  ISupplierSearchResponseValue,
  ISupplierUpdateRequest,
} from './supplier-types';
import { BaseCrudService } from '@/core/services/BaseCrudService';
import { BaseSearchAndCrudService, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';
//Supplier : Id,Name,PhoneNumber

export enum SupplierSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  PhoneNumber = SearchColumEnum.PhoneNumber,
}

@Injectable({
  providedIn: 'root',
})
export class SupplierService extends BaseSearchAndCrudService<
  ISupplierSearchResponseValue,
  SupplierSearchEnum,
  ISupplierCreateRequest,
  ISupplierUpdateRequest,
  ISupplierReadResponse
> {
  override apiRoute = 'Supplier';

  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({
      put: 'Update',
    });
  }
}
