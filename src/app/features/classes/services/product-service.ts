import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export interface IProductRowResponse {
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
    rows: IProductRowResponse[];
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


//MenuItems : Name,CategoryName,CategoryId

export enum ProductSearchEnum {
  Name = SearchColumEnum.Name,
  CategoryName = SearchColumEnum.CategoryName,
  CategoryId = SearchColumEnum.CategoryId,
}

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseService<ProductSearchEnum, any, any, any, IProductSearchResponseValue> {
  override apiRoute = 'MenuItem';
}
