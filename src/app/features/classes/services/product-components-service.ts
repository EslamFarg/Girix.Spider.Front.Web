import { BaseCrudService } from '@/core';
import { Injectable } from '@angular/core';
import { IProductComponentReadResponse } from '../types/product-components/responses';

@Injectable({
  providedIn: 'root',
})
export class ProductComponentsService extends BaseCrudService<any, any, IProductComponentReadResponse> {
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
    return this.http.get<{
      menuItemId: number;
      components: {
        id: number;
        componentId: number;
        componentName: string;
        unitId: number;
        unitName: string;
        quantity: number;
        price: number;
      }[];
    }>(`${this.apiUrl}/by-menu-item/${id}`);
  }

  getList(paginationInfo: { pageIndex: number; pageSize: number } = { pageIndex: 0, pageSize: 0 }) {
    return this.http.post<{
      rows: IProductComponentReadResponse[];
      paginationInfo: {
        totalRowsCount: number;
        totalPagesCount: number;
        currentPageIndex: number;
      };
    }>(`${this.apiUrl}`, {
      paginationInfo,
    });
  }
}
