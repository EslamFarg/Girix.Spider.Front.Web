import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export interface IProductSearchRow {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  costPrice: number;
  tax: number;
  priceWithTax: number;
  priceWithSelectiveTax: number;
  selectiveTax: number;
  description: string;
  images: {
    id: number;
    fullPath: string;
  }[];
  isAddition: boolean;
  additionMenuItem: {
    id: number;
    name: string;
  }[];
}

export interface IProductSearchResponseValue {
  menuItems: {
    rows: IProductSearchRow[];
    paginationInfo: {
      totalRowsCount: number;
      totalPagesCount: number;
      currentPageIndex: number;
    };
  };
  categoriesDtos: IProductCategoryRowResponse[];
}

export interface IProductCategoryRowResponse {
  id: number;
  name: string;
  printerName: string;
  isOnCasher: boolean;
  attachment: {
    id: number;
    fullPath: string;
  }[];
}

//create
export interface IProductCreateRequest {
  nameEn: string;
  nameAr: string;

  descriptionEn: string;
  descriptionAr: string;

  price: number;
  costPrice: number;
  tax: number;
  selectiveTax: number;

  categoryId: number;

  isAddition: boolean;
  idsAdditionMenuItem: number[];

  images: File[];
}

//update
export interface IProductUpdateRequest {
  id: number;
  nameEn: string;
  nameAr: string;

  descriptionEn: string;
  descriptionAr: string;

  price: number;
  costPrice: number;
  tax: number;
  selectiveTax: number;

  categoryId: number;

  isAddition: boolean;
  idsAdditionMenuItem: number[];

  imagesAdd: File[];
  listIdsOfDeleteImages: number[];
}

//get by id

export interface IProductReadResponse {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  costPrice: number;
  tax: number;
  priceWithTax: number;
  selectiveTax: number;
  description: string;
  isAddition: boolean;
  additionMenuItem: {
    id: number;
    name: string;
  }[];
  images: {
    id: number;
    fullPath: string;
  }[];
}

//MenuItems : Name,CategoryName,CategoryId

export enum ProductSearchEnum {
  Name = SearchColumEnum.Name,
  CategoryName = SearchColumEnum.CategoryName,
  CategoryId = SearchColumEnum.CategoryId,
  IsAddition = SearchColumEnum.IsAddition,
}

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseService<
  ProductSearchEnum,
  IProductCreateRequest,
  IProductUpdateRequest,
  IProductReadResponse,
  IProductSearchResponseValue
> {
  override apiRoute = 'MenuItem';

  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({ getById: 'GetById?MenuItemId=' });
  }

  getAdditions(params: { dto: { paginationInfo: { pageIndex: number; pageSize: number } }; isAddition?: boolean }) {
    return this.http.post<{
      rows: IProductSearchRow[];
      paginationInfo: {
        totalRowsCount: number;
        totalPagesCount: number;
      };
    }>(`${this.apiUrl}/GetListIsAdditionMenuItem?IsAddtion=${params.isAddition}`, params.dto);
  }
}
