import { BaseCrudService } from '@/core/services/BaseCrudService';
import { BaseSearchAndCrudService, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';
import BaseService from '@/core/services/BaseService';
import { IMealSearchRow } from '@/features/classes/services/meal-service';
import { IProductSearchRow } from '@/features/classes/services/product-service';
import { Injectable } from '@angular/core';

export interface IProductsAndMealsSearchResponseValue {
  menuItems: {
    rows: IProductSearchRow[];
    paginationInfo: {
      currentPageIndex: number;
      totalRowsCount: number;
      totalPagesCount: number;
    };
  };
  meals: {
    rows: IMealSearchRow[];
    paginationInfo: {
      currentPageIndex: number;
      totalRowsCount: number;
      totalPagesCount: number;
    };
  };
  categoriesDtos: {
    id: number;
    name: string;
    printerName: any;
    isOnCasher: boolean;
    attachment: any[];
  }[];
}

//(MenuItems | Product) + Meals : Name,CategoryName,CategoryId

export enum ProductAndMealsSearchEnum {
  Name = SearchColumEnum.Name,
  CategoryName = SearchColumEnum.CategoryName,
  CategoryId = SearchColumEnum.CategoryId,
}

@Injectable({
  providedIn: 'root',
})
export class GeneralService extends BaseSearchAndCrudService<
  IProductsAndMealsSearchResponseValue,
  ProductAndMealsSearchEnum
> {
  override apiRoute = 'MenuIteamAndMeal';
  /**
   *
   */
  constructor() {
    super();
  }
}
