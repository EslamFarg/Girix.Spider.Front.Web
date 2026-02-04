import BaseService, { IBaseSearchResponse, SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import { ICashBankCustodyAccounts, IFinancialAccountSearchResponseValue } from './financial-account-types';



export enum FinancialAccountSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  FinNumber = SearchColumEnum.FinNumber,
}

@Injectable({
  providedIn: 'root',
})
export class FinancialAccountService extends BaseService<
  FinancialAccountSearchEnum,
  any,
  any,
  any,
  IFinancialAccountSearchResponseValue
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
    return this.http.get<ICashBankCustodyAccounts>(
      `${this.apiUrl}/GetCashAndBankAccountsAndCustodyAccounts`,
    );
  }
}
