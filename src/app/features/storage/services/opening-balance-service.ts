import { BaseSearchAndCrudService, IBaseSearchResponse, ISearchCriteria, SearchColumEnum } from '@/core';
import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import { IOpeningBalanceReadResponse, IOpeningBalanceSearchResponse } from '../types/api/opening-balances/responses';
import { Observable } from 'rxjs';

//OpeningBalance:Id,InvoiceNumber,ReferenceNumber						

export enum OpeningBalanceSearchEnum {
  Id = SearchColumEnum.Id,
  InvoiceNumber = SearchColumEnum.InvoiceNumber,
  ReferenceNumber = SearchColumEnum.ReferenceNumber,
}
						

@Injectable({
  providedIn: 'root',
})
export class OpeningBalanceService extends BaseSearchAndCrudService<any,OpeningBalanceSearchEnum,any,any,IOpeningBalanceReadResponse> {
  override apiRoute = 'OpeningBalance';

  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({
      create: 'create',
      patch: 'update',
      delete: 'delete?id=',
      getById: 'GetById?id=',
    })
  }
  
  override search<T =IOpeningBalanceSearchResponse>(criteriaDto: ISearchCriteria<OpeningBalanceSearchEnum>) {
    return super.search<T>(criteriaDto);
  }

   getByInvoiceNumber(invoiceNumber: string){
    return this.http.get<IOpeningBalanceReadResponse>(`${this.apiUrl}/GetByInvoiceNumber?invoiceNumber=${invoiceNumber}`);
  }
}
