import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export enum HutSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  IsAvaliable = SearchColumEnum.IsAvaliable,
}

export interface IHutRowResponse {
  id: number
  name: string
  pricePerHour: number
  isAvailable: boolean
  reservedTo: any
  reservedFrom: any
  orderId: number
}
@Injectable({
  providedIn: 'root',
})
export class HutService extends BaseService<HutSearchEnum, IHutRowResponse> {
  override apiRoute = 'Hut';
}
