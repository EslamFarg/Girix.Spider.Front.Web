import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import {
  ICashBankCustodyAccounts,
  IFinancialAccountSearchResponseValue,
  IFinancialAccountSearchRow,
  IFinancialAccountTreeResponseValue,
  IFinancialAccountTreeRow,
  ITreeFinancialAccountReadResponse,
} from '../types';
import { BaseSearchAndCrudService, IBaseSearchResponse, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';
import { IFinancialAccountCreateRequest, IFinancialAccountUpdateRequest } from '../types/financial-account/api/request';

export enum FinancialAccountSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  FinNumber = SearchColumEnum.FinNumber,
}
export enum AccountStatus {
  Active = 1, // نشط
  Inactive = 2, // غير نشط
  Closed = 3, // مغلق
}
export enum AccountGroup {
  Assets = 1, // الأصول
  Liabilities = 2, // الخصوم
  Equity = 3, // حقوق الملكية
  Revenues = 4, // الإيرادات
  Expenses = 5, // المصروفات
}
export enum FinalAccountType {
  None = 0, // بدون
  IncomeStatement = 1, // قائمة الدخل
  BalanceSheet = 2, // الميزانية
}
export enum BalanceNature {
  Debit = 1,
  Credit = 2,
}

@Injectable({
  providedIn: 'root',
})
export class FinancialAccountService extends BaseSearchAndCrudService<
  IFinancialAccountSearchResponseValue,
  FinancialAccountSearchEnum,
  IFinancialAccountCreateRequest,
  IFinancialAccountUpdateRequest,
  ITreeFinancialAccountReadResponse
> {
  override apiRoute = 'FinancialAccount';
  /**
   *
   */
  constructor() {
    super();
  }

  getFullTree() {
    return this.http.post<IBaseSearchResponse<IFinancialAccountTreeResponseValue>>(`${this.apiUrl}/GetFinancialAccountTree`, {
      criteriaDto: {
        paginationInfo: {
          pageIndex: 0,
          pageSize: 0,
        },
      },
      searchFilters: [
        {
          column: 0,
          values: [''],
        },
      ],
      fromDate: null,
      toDate: this.localDateIso,
    });
  }

  flattenTree(accounts: IFinancialAccountTreeRow[]): IFinancialAccountSearchRow[] {
    return accounts.flatMap((account) => {
      const { children, ...flatAccount } = account;
      return [flatAccount, ...this.flattenTree(children)];
    });
  }

  getCashAndBankAccountsAndCustodyAccounts() {
    return this.http.get<ICashBankCustodyAccounts>(`${this.apiUrl}/GetCashAndBankAccountsAndCustodyAccounts`);
  }
}
