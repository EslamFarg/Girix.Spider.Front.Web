import { BaseCrudService } from '@/core';
import { Injectable } from '@angular/core';
import { IComponentReadResponse, IProductComponentsReadResponse } from '../types/product-components/responses';
import { IProductComponentCreateRequest, IProductComponentUpdateRequest } from '../types/product-components/requests';

@Injectable({
  providedIn: 'root',
})
export class ProductComponentsService extends BaseCrudService<
  IProductComponentCreateRequest,
  IProductComponentUpdateRequest
> {
  override apiRoute = 'MenuItemComponent';

  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({
      create: 'create',
      getById: '',
      delete: '',
      put: 'update',
    });
  }

  //v1/MenuItemComponent/by-menu-item/{menuItemId}
  getByProductId(id: number) {
    return this.http.get<IProductComponentsReadResponse>(`${this.apiUrl}/by-menu-item/${id}`);
  }


}
