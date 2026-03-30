import { BaseSearchAndCrudService, SearchColumEnum } from '@/core';
import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export interface IUnitReadResponse {
  id: number;
  nameEn: string;
  nameAr: string;
}

export interface IUnitSearchResponseValue {
  rows: IUnitSearchRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}

export interface IUnitSearchRow {
  id: number;
  nameEn: string;
  nameAr: string;
}

export enum UnitSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
}

@Injectable({
  providedIn: 'root',
})
export class UnitService extends BaseSearchAndCrudService<
  IUnitSearchResponseValue,
  UnitSearchEnum,
  any,
  any,
  IUnitReadResponse
> {
  override apiRoute = 'Unit';

  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({
      create: 'create',
      getById: '',
      delete: '',
      put: 'update',
    });
  }
}
