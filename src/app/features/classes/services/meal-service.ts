import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export interface IMealSearchRow {
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
  rows: IMealSearchRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}

export interface IMealCreateRequest {
  NameAr: string;
  NameEn: string;
  CategoryId: number;
  Price: number;
  CostPrice: number;
  Tax: number;
  SelectiveTax: number;
  DescriptionAr: string;
  DescriptionEn: string;
  MenuItems: {
    id: number;
    quantity: number;
  }[];
  Images: File[];
}

export interface IMealUpdateRequest {
  id: number;
  NameAr: string;
  NameEn: string;
  CategoryId: number;
  Price: number;
  CostPrice: number;
  Tax: number;
  SelectiveTax: number;
  DescriptionAr: string;
  DescriptionEn: string;
  MenuItems: {
    id: number;
    quantity: number;
  }[];
  ImagesAdd: File[];
  ListIdsOfDeleteImages: number[];
}

export interface IMealReadResponse {
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

//Meals  : Name,CategoryName

export enum MealSearchEnum {
  Name = SearchColumEnum.Name,
  CategoryName = SearchColumEnum.CategoryName,
}

@Injectable({
  providedIn: 'root',
})
export class MealService extends BaseService<
  MealSearchEnum,
  IMealCreateRequest,
  IMealUpdateRequest,
  IMealReadResponse,
  IMealSearchResponseValue
> {
  override apiRoute = 'Meals';
  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({ getById: 'GetById?id=' });
  }
}
