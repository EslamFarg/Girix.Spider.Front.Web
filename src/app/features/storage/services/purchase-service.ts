import { BaseSearchAndCrudService, ISearchCriteria, SearchColumEnum } from '@/core';
import { Injectable } from '@angular/core';
import { IPurchaseReadResponse, IPurchaseSearchResponseValue } from '../types/api/purchases/responses';

//PurchaseInvoice: Id,InvoiceNumber,ReferenceNumber,Name

export enum PurchaseSearchEnum {
  Id = SearchColumEnum.Id,
  InvoiceNumber = SearchColumEnum.InvoiceNumber,
  ReferenceNumber = SearchColumEnum.ReferenceNumber,
  Name = SearchColumEnum.Name,
}

@Injectable({
  providedIn: 'root',
})
export class PurchaseService extends BaseSearchAndCrudService<
  IPurchaseSearchResponseValue,
  PurchaseSearchEnum,
  any,
  any,
  IPurchaseReadResponse
> {
  override apiRoute = 'PurchaseInvoice';

  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({
      create: 'create',
      put: 'update',
      delete: 'delete?id=',
      getById: 'GetById?id=',
    });
  }

  override search<T = IPurchaseSearchResponseValue>(criteriaDto: ISearchCriteria<PurchaseSearchEnum>) {
    return super.search<T>(criteriaDto);
  }

  //v1/PurchaseInvoice/getbyinvoicenumber
  getByInvoiceNumber(invoiceNumber: string) {
    return this.http.get<IPurchaseReadResponse>(
      `${this.apiUrl}/getbyinvoicenumber?invoiceNumber=${invoiceNumber}`,
    );
  }
}
