import { BaseSearchAndCrudService, ISearchCriteria, SearchColumEnum } from '@/core';
import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import {
  IInventoryProductSearchResponse,
  IInventoryReadResponse,
  IInventorySettlementSearchResponseValue,
} from '../types/api/inventory/responses';

//Inventory :Id,Name,Quantity
export enum InventoryProductSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  Quantity = SearchColumEnum.Quantity,
}
//InventorySettlement:Id,InvoiceNumber,ReferenceNumber,Name

export enum InventorySettlementSearchEnum {
  Id = SearchColumEnum.Id,
  InvoiceNumber = SearchColumEnum.InvoiceNumber,
  ReferenceNumber = SearchColumEnum.ReferenceNumber,
}

@Injectable({
  providedIn: 'root',
})
export class InventoryService extends BaseSearchAndCrudService<
  any,
  InventorySettlementSearchEnum,
  any,
  any,
  IInventoryReadResponse
> {
  override apiRoute = 'InventorySettlement';

  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({
      create: 'create',
      put: 'update',
      delete: 'delete',
      getById: 'getbyid?id=',
    });
  }

  override search<T = IInventorySettlementSearchResponseValue>(
    criteriaDto: ISearchCriteria<InventorySettlementSearchEnum>,
  ) {
    return super.search<T>(criteriaDto);
  }

  searchProducts(criteriaDto: ISearchCriteria<InventoryProductSearchEnum>) {
    return this.http.post<IInventoryProductSearchResponse>(`${this.apiUrl}/inventory/search`, criteriaDto);
  }

  getByNumber(number: string) {
    return this.http.get<IInventoryReadResponse>(`${this.apiRoute}/getbynumber?number=${number}`);
  }
}
