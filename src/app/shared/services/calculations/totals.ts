import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Totals {

  getTotal(items: any[]): number {
    if(!items) return 0;
    if(!Array.isArray(items)) return 0;
    let total = 0;
    items.forEach((item: any) => {
      total += item;
    })
    return total;
  }


}
