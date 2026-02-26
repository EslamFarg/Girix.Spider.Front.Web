import { BaseCrudService } from '@/core/services/BaseCrudService';
import { BaseSearchAndCrudService, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';
import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export enum RoomSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  IsAvaliable = SearchColumEnum.IsAvaliable,
}
export interface IRoomCreateRequest {
  name: string;
}
export interface IRoomUpdateRequest {
  id: number;
  name: string;
}

//search

export interface IRoomSearchRow {
  id: number;
  name: string;
  pricePerHour: number;
  isAvailable: boolean;
  reservedTo: any;
  reservedFrom: any;
  orderId: number;
}

export interface IRoomSearchResponse {
  rows: IRoomSearchRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}

//get by id

export interface IRoomReadResponse {
  id: number;
  name: string;
  isAvailable: boolean;
  reservedFrom: string;
  orderId: number;
}

@Injectable({
  providedIn: 'root',
})
export class RoomService extends BaseSearchAndCrudService<
  IRoomSearchResponse,
  RoomSearchEnum,
  IRoomCreateRequest,
  IRoomUpdateRequest,
  IRoomReadResponse
> {
  override apiRoute = 'Room';


  constructor() {
    super();
    this.patchEndpoints({put: 'update'})
  }
}
