import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
import { IMealRowResponse } from '@/features/classes/services/meal-service';
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
    rows: IMealRowResponse[];
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
export class GeneralService extends BaseService<
  ProductAndMealsSearchEnum,
  any,
  any,
  any,
  IProductsAndMealsSearchResponseValue
> {
  override apiRoute = 'MenuIteamAndMeal';


  
}
