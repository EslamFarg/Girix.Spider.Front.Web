import BaseService, { IBaseSearchResponse, SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import { ICashBankCustodyAccounts } from './financial-account-types';

export interface ITreeFinancialAccountResponseRow {
  id: number;
  name: string;
  parentId: any;
  stage: number;
  finNumber: string;
  balanceNature: number;
  finalAccountBalance: any;
  children: ITreeFinancialAccountResponseRow[];
}

export interface IFinancialAccountSearchResponseValue {
  rows: ITreeFinancialAccountResponseRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}

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
