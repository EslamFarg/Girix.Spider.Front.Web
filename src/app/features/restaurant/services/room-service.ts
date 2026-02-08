import { BaseCrudService } from '@/core/services/BaseCrudService';
import BaseService from '@/core/services/BaseService';
import { SearchableMixin, SearchColumEnum } from '@/core/services/interfaces';
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
export class RoomService extends SearchableMixin(
  BaseCrudService<IRoomCreateRequest, IRoomUpdateRequest, IRoomReadResponse>,
)<IRoomSearchResponse, RoomSearchEnum>() {
  override apiRoute = 'Room';
}
