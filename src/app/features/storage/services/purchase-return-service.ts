import { BaseSearchAndCrudService, ISearchCriteria, SearchColumEnum } from '@/core';
import { Injectable } from '@angular/core';
import { IPurchaseReturnReadResponse, IPurchaseReturnSearchResponseValue } from '../types/api/purchase-return/responses';
import { IPurchaseReadResponse } from '../types/api/purchases/responses';

//PurchaseReturn :Id,InvoiceNumber,ReferenceNumber,Name

export enum PurchaseReturnSearchEnum {
  Id = SearchColumEnum.Id,
  InvoiceNumber = SearchColumEnum.InvoiceNumber,
  ReferenceNumber = SearchColumEnum.ReferenceNumber,
  Name = SearchColumEnum.Name,
}

@Injectable({
  providedIn: 'root',
})
export class PurchaseReturnService extends BaseSearchAndCrudService<
  IPurchaseReturnSearchResponseValue,
  PurchaseReturnSearchEnum,
  any,
  any,
  IPurchaseReturnReadResponse
> {
  override apiRoute = 'PurchaseReturn';

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

  override search<T = IPurchaseReturnSearchResponseValue>(criteriaDto: ISearchCriteria<PurchaseReturnSearchEnum>) {
    return super.search<T>(criteriaDto);
  }

  //v1/PurchaseInvoice/getbyinvoicenumber
  getByInvoiceNumber(invoiceNumber: string) {
    return this.http.get<IPurchaseReturnReadResponse>(
      `${this.apiUrl}/getbyinvoicenumber?invoiceNumber=${invoiceNumber}`,
    );
  }

  /** Remaining returnable quantities for a purchase invoice (mirrors OrderReturn/remaining). */
  getPurchaseRemaining(purchaseInvoiceId: number) {
    return this.http.get<IPurchaseReadResponse>(
      `${this.apiUrl}/purchase/${purchaseInvoiceId}/remaining`,
    );
  }
  
}
