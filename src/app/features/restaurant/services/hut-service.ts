import { BaseCrudService } from '@/core/services/BaseCrudService';
import BaseService from '@/core/services/BaseService';
import { SearchableMixin, SearchColumEnum } from '@/core/services/interfaces';
import { Injectable } from '@angular/core';

export enum HutSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  IsAvaliable = SearchColumEnum.IsAvaliable,
}

export interface IHutCreateRequest {
  name: string;
  pricePerHour: number;
}
export interface IHutUpdateRequest {
  id: number;
  name: string;
  pricePerHour: number;
}

//search
export interface IHutSearchResponseValue {
  rows: IHutSearchRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}

export interface IHutSearchRow {
  id: number;
  name: string;
  pricePerHour: number;
  isAvailable: boolean;
  reservedTo: any;
  reservedFrom: any;
  orderId: number;
}
//get by id

export interface IHutReadResponse {
  id: number;
  name: string;
  isAvailable: boolean;
  reservedFrom: string;
  orderId: number;
}

@Injectable({
  providedIn: 'root',
})
export class HutService extends SearchableMixin(
  BaseCrudService<IHutCreateRequest, IHutUpdateRequest, IHutReadResponse>,
)<IHutSearchResponseValue, HutSearchEnum>() {
  override apiRoute = 'Hut';
}
