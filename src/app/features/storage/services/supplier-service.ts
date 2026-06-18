import { BaseSearchAndCrudService, ISearchCriteria, SearchColumEnum } from '@/core';
import { Injectable } from '@angular/core';
import { ISupplierReadResponse, ISupplierSearchResponseValue } from '../types/api/supplier/responses';

//Supplier: Id,Name,PhoneNumber

export enum SupplierSearchEnum {
  Id = SearchColumEnum.Id,
  PhoneNumber = SearchColumEnum.PhoneNumber,
  Name = SearchColumEnum.Name,
}

@Injectable({
  providedIn: 'root',
})
export class SupplierService extends BaseSearchAndCrudService<
  ISupplierSearchResponseValue,
  SupplierSearchEnum,
  any,
  any,
  ISupplierReadResponse
> {
  override apiRoute = 'Supplier';

  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({
      create: 'create',
      put: 'update',
      delete: '',
      getById:''
    });
  }


  getDefaultSupplier(){
    return this.http.get<{
            id: number;
            name: string;
            supplierCode: string;
            phoneNumber: string;
            secondaryMobileNumber: string;
            city: string;
            district: string;
            street: string;
            buildingNumber: string;
            apartment: string;
            landmark: string;
            postalCode: string;
            commercialRegister: string;
            taxNumber: string;
            isCompany: boolean;
            numberOfFloor: number;
            financiallyAccountId: number;
        }>(`${this.apiRoute}/GetCashSupplierByAccount`);
  }

 
}
