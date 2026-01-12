import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
//MenuItems : Name,CategoryName,CategoryId

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

export enum ProductSearchEnum {
  Name = SearchColumEnum.Name,
  CategoryName = SearchColumEnum.CategoryName,
  CategoryId = SearchColumEnum.CategoryId,
}

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseService<ProductSearchEnum, IProductRowResponse, any, any, any> {
  override apiRoute = 'Order';
}
