import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export interface IUserRowResponse {
  userId: number;
  name: string;
  email: string;
  phoneNumber: string;
  groupId: number;
}

export interface IUserSearchResponseValue {
  rows: IUserRowResponse[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}

//MenuItems : Id,Name,PhoneNumber

export enum UserSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  PhoneNumber = SearchColumEnum.PhoneNumber,
}

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService<UserSearchEnum, any, any, any, IUserSearchResponseValue> {
  override apiRoute = 'Users';
}
 
