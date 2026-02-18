import { IPaginatedResponse } from '@/core/interfaces/responses';
import { BaseCrudService } from '@/core/services/BaseCrudService';
import { BaseSearchAndCrudService, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';
import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export interface IGroupSearchRow {
  id: number;
  name: string;
  printerName: string;
  isOnCasher: boolean;
  attachment: { id: number; fullPath: string }[];
}

export interface IGroupSearchResponseValue {
  rows: IGroupSearchRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}

export interface IGroupReadResponse {
  id: number;
  name: string;
  printerId: number;
  printerName: string;
  isOnCasher: boolean;
  description: string;
  attachment: IGroupAttachment[];
}

export interface IGroupAttachment {
  id: number;
  fullPath: string;
}

//MenuItems : id,Name

export enum GroupSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
}

@Injectable({
  providedIn: 'root',
})
export class GroupService extends BaseSearchAndCrudService<
  IGroupSearchResponseValue,
  GroupSearchEnum,
  any,
  any,
  IGroupReadResponse
> {
  override apiRoute = 'Category';

  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({ getById: 'GetById?id=' });
  }

  getList(IsOnCasher: boolean = false, paginationInfo: { pageIndex: number; pageSize: number }) {
    return this.http.post<IPaginatedResponse<IGroupSearchRow>>(
      `${this.apiUrl}/ListCategoriesOnCasher?IsOnCasher=${IsOnCasher}`,
      {
        paginationInfo,
      },
    );
  }
}
