import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import {
  IUserCreateRequest,
  IUserCreateUpdateRequest,
  IUserReadResponse,
  IUserSearchResponseValue,
} from './user-types';
import { BaseCrudService } from '@/core/services/BaseCrudService';
import { SearchableMixin, SearchColumEnum } from '@/core/services/interfaces';

//MenuItems : Id,Name,PhoneNumber

export enum UserSearchEnum {
  Id = SearchColumEnum.Id,
  Name = SearchColumEnum.Name,
  PhoneNumber = SearchColumEnum.PhoneNumber,
}

@Injectable({
  providedIn: 'root',
})
export class UserService extends SearchableMixin(
  BaseCrudService<
   IUserCreateRequest,
  IUserCreateUpdateRequest,
  IUserReadResponse
 >
)<IUserSearchResponseValue,UserSearchEnum >() {
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
