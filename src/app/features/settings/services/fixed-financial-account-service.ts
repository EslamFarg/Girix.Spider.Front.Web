import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

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
      })
      .subscribe();

  patchAccouts = (items: IFixedFinancialAccountPatchRow[]) => this.http.patch(`${this.apiUrl}`, items).subscribe();
}
