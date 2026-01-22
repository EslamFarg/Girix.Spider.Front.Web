import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export enum RoomSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  IsAvaliable = SearchColumEnum.IsAvaliable,
}
export interface IRoomCreateDto {
  name: string;
}
export interface IRoomUpdateDto {
  id: number;
  name: string;
}
export interface IRoomSearchRowResponse {
  id: number;
  name: string;
  pricePerHour: number;
  isAvailable: boolean;
  reservedTo: any;
  reservedFrom: any;
  orderId: number;
}

export interface IRoomSearchResponse {
  rows: IRoomSearchRowResponse[];
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
export class RoomService extends BaseService<
  RoomSearchEnum,
  IRoomCreateDto,
  IRoomUpdateDto,
  IRoomReadResponse,
  IRoomSearchResponse
> {
  override apiRoute = 'Room';
}
