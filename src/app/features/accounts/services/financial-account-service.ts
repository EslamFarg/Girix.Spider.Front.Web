import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import { ICashBankCustodyAccounts, IFinancialAccountSearchResponseValue } from './financial-account-types';
import { BaseCrudService } from '@/core/services/BaseCrudService';
import { BaseSearchAndCrudService, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';

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
    this.patchEndpoints({ search: 'GetFinancialAccountTree' });
  }

  getCashAndBankAccountsAndCustodyAccounts() {
    return this.http.get<ICashBankCustodyAccounts>(`${this.apiUrl}/GetCashAndBankAccountsAndCustodyAccounts`);
  }
}
