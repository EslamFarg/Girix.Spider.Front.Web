import { IPaginatedResponse } from '@/core/interfaces/responses';
import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export interface IGroupRowResponse {
  id: number;
  name: string;
  printerName: string;
  isOnCasher: boolean;
  attachment: { id: number; fullPath: string }[];
}

export interface IGroupSearchResponseValue {
  rows: IGroupRowResponse[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}

//MenuItems : id,Name

export enum GroupSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
}

@Injectable({
  providedIn: 'root',
})
export class GroupService extends BaseService<GroupSearchEnum, any, any, any, IGroupSearchResponseValue> {
  override apiRoute = 'Category';

  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({ getById: 'GetById?id=' });
  }

  getList(IsOnCasher: boolean = false, paginationInfo: { pageIndex: number; pageSize: number }) {
    return this.http.post<IPaginatedResponse<IGroupRowResponse>>(
      `${this.apiUrl}/ListCategoriesOnCasher?IsOnCasher=${IsOnCasher}`,
      {
        paginationInfo,
      }
    );
  }
}
