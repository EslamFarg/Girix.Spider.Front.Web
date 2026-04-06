import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import { ICashBankCustodyAccounts, IFinancialAccountSearchResponseValue } from '../types';
import { BaseCrudService } from '@/core/services/BaseCrudService';
import { BaseSearchAndCrudService, ISearchCriteria, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';

export enum FinancialAccountSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  FinNumber = SearchColumEnum.FinNumber,
}

@Injectable({
  providedIn: 'root',
})
export class FinancialAccountService extends BaseSearchAndCrudService<
  IFinancialAccountSearchResponseValue,
  FinancialAccountSearchEnum
> {
  override apiRoute = 'FinancialAccount';
  /**
   *
   */
  constructor() {
    super();
  }

  getFinancialAccountTree(dto: ISearchCriteria<FinancialAccountSearchEnum>) {
    return this.search({ ...dto, searchEndpoint: 'GetFinancialAccountTree' });
  }

  getCashAndBankAccountsAndCustodyAccounts() {
    return this.http.get<ICashBankCustodyAccounts>(`${this.apiUrl}/GetCashAndBankAccountsAndCustodyAccounts`);
  }
}
