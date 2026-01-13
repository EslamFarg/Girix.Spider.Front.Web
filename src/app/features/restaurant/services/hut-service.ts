import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export enum HutSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  IsAvaliable = SearchColumEnum.IsAvaliable,
}

export interface IHutCreateDto {
  name: string;
  pricePerHour: number;
}
export interface IHutUpdateDto {
  id: number;
  name: string;
  pricePerHour: number;
}

export interface IHutRowResponse {
  id: number;
  name: string;
  pricePerHour: number;
  isAvailable: boolean;
  reservedTo: any;
  reservedFrom: any;
  orderId: number;
}
export interface IHutDtoResponse {
  id: number;
  name: string;
  isAvailable: boolean;
  reservedFrom: string;
  orderId: number;
}

export interface IHutSearchResponse {
  rows: IHutRowResponse[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class HutService extends BaseService<
  HutSearchEnum,
  IHutCreateDto,
  IHutUpdateDto,
  IHutDtoResponse,
  IHutSearchResponse
> {
  override apiRoute = 'Hut';
}
