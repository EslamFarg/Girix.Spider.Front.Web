import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import {
  IUserCreateRequest,
  IUserCreateUpdateRequest,
  IUserReadResponse,
  IUserSearchResponseValue,
} from './user-types';

//MenuItems : Id,Name,PhoneNumber

export enum UserSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  PhoneNumber = SearchColumEnum.PhoneNumber,
}

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService<
  UserSearchEnum,
  IUserCreateRequest,
  IUserCreateUpdateRequest,
  IUserReadResponse,
  IUserSearchResponseValue
> {
  override apiRoute = 'Users';

  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({
      create: '',
    });
  }
}
