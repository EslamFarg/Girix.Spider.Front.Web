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
    let priceWithTax = 0;
    let priceWithSelectiveTax = 0;
    if (item.menuItem.meal) {
      priceWithTax = item.menuItem.meal.priceWithTax;
      priceWithSelectiveTax = item.menuItem.meal.priceWithSelectiveTax;
    } else {
      priceWithTax = item.menuItem.product!.priceWithTax;
      priceWithSelectiveTax = item.menuItem.product!.priceWithSelectiveTax;
    }

    const mainItemsTaxValue = (priceWithTax - priceWithSelectiveTax) * item.menuItem.quantity;
    const additionsTaxValue = item.additions.reduce(
      (total, addition) =>
        total + (addition.product.priceWithTax - addition.product.priceWithSelectiveTax) * addition.quantity,
      0,
    );
    console.log(mainItemsTaxValue, additionsTaxValue);
    return mainItemsTaxValue + additionsTaxValue;
  };

  getMenuItemNetValue = (item: IOrderMenuItem) => {
    let itemNet = 0;
    const additionsNet = item.additions.reduce(
      (total, addition) => total + addition.product.priceWithTax * addition.quantity,
      0,
    );
    if (item.menuItem.meal) {
      itemNet = +(item.menuItem.meal.priceWithTax ?? 0);
    } else {
      itemNet = +(item.menuItem.product?.priceWithTax ?? 0);
    }

    return itemNet * item.menuItem.quantity + additionsNet;
    // return (itemNet + additionsNet) * item.menuItem.quantity;
  };

  getProductTaxValue(item: IProductSearchRow, quantity: number): number {
    const tax = item.priceWithTax - item.priceWithSelectiveTax;
    return tax * quantity;
  }

  getMenuItemUnitPriceWithoutAdditionsWithSelectiveTax = (item: IOrderMenuItem) =>
    item.menuItem.meal ? item.menuItem.meal.priceWithSelectiveTax : item.menuItem.product?.priceWithSelectiveTax;

  getMenuItemUnitPriceWithoutAdditionsWithTax = (item: IOrderMenuItem) =>
    item.menuItem.meal ? item.menuItem.meal.priceWithTax : item.menuItem.product?.priceWithTax;

  getMealTaxValue(item: IMealSearchRow, quantity: number): number {
    const tax = item.priceWithTax - item.priceWithSelectiveTax;
    return tax * quantity;
  }

  getMenuItemPriceWithSelectiveTaxWithoutAdditions = (item: IOrderMenuItem) => {
    if (item.menuItem.meal) {
      return +(item.menuItem.meal.priceWithSelectiveTax ?? 0) * item.menuItem.quantity;
    } else {
      return +(item.menuItem.product?.priceWithSelectiveTax ?? 0) * item.menuItem.quantity;
    }
  };
  getMenuItemPriceWithAdditionsWithSelectiveTax = (item: IOrderMenuItem) => {
    let unitPriceWithSelectiveTax = 0;
    const addidtionsPriceWithSelectiveTax = item.additions.reduce(
      (total, addition) => total + addition.product.priceWithSelectiveTax * addition.quantity,
      0,
    );
    if (item.menuItem.meal) {
      unitPriceWithSelectiveTax = item.menuItem.meal.priceWithSelectiveTax ?? 0;
    } else {
      unitPriceWithSelectiveTax = item.menuItem.product?.priceWithSelectiveTax ?? 0;
    }

    return unitPriceWithSelectiveTax * item.menuItem.quantity + addidtionsPriceWithSelectiveTax;
    //    return (unitPriceWithSelectiveTax + addidtionsPriceWithSelectiveTax) * item.menuItem.quantity;
  };
  getMenuItemWithTaxWithoutAdditions = (item: IOrderMenuItem) => {
    if (item.menuItem.meal) {
      return +(item.menuItem.meal.priceWithSelectiveTax ?? 0) * item.menuItem.quantity;
    } else {
      return +(item.menuItem.product?.priceWithSelectiveTax ?? 0) * item.menuItem.quantity;
    }
  };
}
