import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export enum TableSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  IsAvaliable = SearchColumEnum.IsAvaliable,
}
export interface ITableCreateDto {
  name: string;
}
export interface ITableUpdateDto {
  id: number;
  name: string;
}
export interface ITableRowResponse {
  id: number;
  name: string;
  pricePerHour: number;
  isAvailable: boolean;
  reservedTo: any;
  reservedFrom: any;
  orderId: number;
}
export interface ITableDtoResponse {
  id: number;
  name: string;
  isAvailable: boolean;
  reservedFrom: string;
  orderId: number;
}

@Injectable({
  providedIn: 'root',
})
export class TableService extends BaseService<
  TableSearchEnum,
  ITableRowResponse,
  ITableCreateDto,
  ITableUpdateDto,
  ITableDtoResponse
> {
  override apiRoute = 'Table';
}
