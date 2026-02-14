import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import {
  IUserCreateRequest,
  IUserCreateUpdateRequest,
  IUserReadResponse,
  IUserSearchResponseValue,
} from './user-types';
import { BaseCrudService } from '@/core/services/BaseCrudService';
import { BaseSearchAndCrudService, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';

//MenuItems : Id,Name,PhoneNumber

export enum UserSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  PhoneNumber = SearchColumEnum.PhoneNumber,
}

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseSearchAndCrudService<
  IUserSearchResponseValue,
  UserSearchEnum,
  IUserCreateRequest,
  IUserCreateUpdateRequest,
  IUserReadResponse
> {
  override apiRoute = 'Users';

  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({
      create: '',
      update: '',
    });
  }
}
