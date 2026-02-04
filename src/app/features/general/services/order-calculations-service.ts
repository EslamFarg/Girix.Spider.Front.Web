import { Injectable } from '@angular/core';
import { IOrderMenuItem } from '../components/menu/menu';
import { IProductSearchRow } from '@/features/classes/services/product-service';
import { IMealSearchRow } from '@/features/classes/services/meal-service';
// export interface IMenuItem {
//   id: string;
//   index: number;
//   product: IProductSearchRow | null;
//   meal: IMealSearchRow | null;
//   quantity: number;
// }

// export interface IMenuItemAddition {
//   product: IProductSearchRow;
//   quantity: number;
// }
@Injectable({
  providedIn: 'root',
})
export class OrderCalculationsService {
  getMenuItemTaxValue = (item: IOrderMenuItem) => {
    if (item.menuItem.meal) {
      return this.getMealTaxValue(item.menuItem.meal, item.menuItem.quantity);
    } else {
      return this.getProductTaxValue(item.menuItem.product!, item.menuItem.quantity);
    }
  };

  getMenuItemNetValue = (item: IOrderMenuItem) => {
    if (item.menuItem.meal) {
      return (+(item.menuItem.meal.priceWithTax ?? 0) * item.menuItem.quantity).toFixed(2);
    } else {
      return (+(item.menuItem.product?.priceWithTax ?? 0) * item.menuItem.quantity).toFixed(2);
    }
  };

  getProductTaxValue(item: IProductSearchRow, quantity: number): number {
    const tax = item.priceWithTax - item.priceWithSelectiveTax;
    return tax * quantity;
  }
  getMealTaxValue(item: IMealSearchRow, quantity: number): number {
    const tax = item.priceWithTax - item.priceWithSelectiveTax;
    return tax * quantity;
  }
}
