import { IPaginatedResponse } from '@/core/interfaces/responses';
import { BaseCrudService } from '@/core/services/BaseCrudService';
import BaseService from '@/core/services/BaseService';
import { SearchableMixin, SearchColumEnum } from '@/core/services/interfaces';
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
export class GroupService extends SearchableMixin(BaseCrudService<any, any, IGroupReadResponse>)<
  IGroupSearchResponseValue,
  GroupSearchEnum
>() {
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
