import { BaseCrudService } from '@/core/services/BaseCrudService';
import { BaseSearchAndCrudService, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';
import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export enum TableSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  IsAvaliable = SearchColumEnum.IsAvaliable,
}
export interface ITableCreateRequest {
  name: string;
}
export interface ITableUpdateRequest {
  id: number;
  name: string;
}

//search
export interface ITableSearchRow {
  id: number;
  name: string;
  pricePerHour: number;
  isAvailable: boolean;
  reservedTo: any;
  reservedFrom: any;
  orderId: number;
}

export interface ITableSearchResponse {
  rows: ITableSearchRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}

//get by id
export interface ITableReadResponse {
  id: number;
  name: string;
  isAvailable: boolean;
  reservedFrom: string;
  orderId: number;
}

@Injectable({
  providedIn: 'root',
})
export class TableService extends BaseSearchAndCrudService<
  ITableSearchResponse,
  TableSearchEnum,
  ITableCreateRequest,
  ITableUpdateRequest,
  ITableReadResponse
> {
  override apiRoute = 'Table';

  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({put: 'Update'})
  }
}
