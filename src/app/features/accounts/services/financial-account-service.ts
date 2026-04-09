import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import {
  ICashBankCustodyAccounts,
  IFinancialAccountSearchResponseValue,
  ITreeFinancialAccountReadResponse,
} from '../types';
import { BaseCrudService } from '@/core/services/BaseCrudService';
import { BaseSearchAndCrudService, ISearchCriteria, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';
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

  getFinancialAccountTree(dto: ISearchCriteria<FinancialAccountSearchEnum>) {
    return this.search({ ...dto, searchEndpoint: 'GetFinancialAccountTree' });
  }

  getCashAndBankAccountsAndCustodyAccounts() {
    return this.http.get<ICashBankCustodyAccounts>(`${this.apiUrl}/GetCashAndBankAccountsAndCustodyAccounts`);
  }
}
