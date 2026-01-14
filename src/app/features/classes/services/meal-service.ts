import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export interface IMealRowResponse {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  costPrice: number;
  tax: number;
  selectiveTax: number;
  priceWithTax: number;
  priceWithSelectiveTax: number;
  description: string;
  images: {
    id: number;
    fullPath: string;
  }[];
  menuItems: {
    id: number;
    name: string;
    quantity: number;
  }[];
}

export interface IMealSearchResponseValue {
  rows: IMealRowResponse[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}
export interface ICategoryRowResponse {
  id: number;
  name: string;
  printerName: string;
  isOnCasher: boolean;
  attachment: {
    id: number;
    fullPath: string;
  }[];
}

//Meals  : Name,CategoryName

export enum MealSearchEnum {
  Name = SearchColumEnum.Name,
  CategoryName = SearchColumEnum.CategoryName,
}

@Injectable({
  providedIn: 'root',
})
export class MealService extends BaseService<MealSearchEnum, any, any, any, IMealSearchResponseValue> {
  override apiRoute = 'Meals';
}
