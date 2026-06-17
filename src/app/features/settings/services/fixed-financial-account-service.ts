import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

/**
 * Stable backend identifiers for each fixed/default account type.
 * These refId values correspond to the rows returned by FixedFinancalAccount API.
 * Verify against Settings → Default Accounts if auto-fill produces unexpected results.
 */
export enum FixedFinancialAccountRefId {
  CashPayment    = 1, // حساب الدفع النقدي
  NetworkPayment = 2, // حساب الدفع الشبكي
  CashSupplier   = 3, // حساب مورد نقدي
  CreditSupplier = 4, // حساب مورد آجل
  TaxAccount     = 5, // حساب الضريبة
}

export interface IFixedFinancialAccountRow {
  id: number;
  name: string;
  refId: number;
  refFinancalId: number;
}

export interface IFixedFinancialAccountPatchRow {
  id: number;
  refFinancalId: number;
}

export interface IFixedFinancialAccountListResponse {
  rows: IFixedFinancialAccountRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class FixedFinancialAccountService extends BaseService {
  override apiRoute = 'FixedFinancalAccount';

  getAll = () =>
    this.http
      .post<IFixedFinancialAccountListResponse>(`${this.apiUrl}`, {
        paginationInfo: {
          pageIndex: 0,
          pageSize: 0,
        },
      });

  patchAccouts = (items: IFixedFinancialAccountPatchRow[]) => this.http.patch(`${this.apiUrl}`, items).subscribe();
}
