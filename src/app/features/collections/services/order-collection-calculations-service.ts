import { IOrderBillReadResponse, OrderLocationType } from '@/features/orders';
import { SpaceTypeEnum } from '@/features/replacements/services/replacements-service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OrderCollectionCalculationsService {
  calculateBillNet(bill: IOrderBillReadResponse): number {
    if(!bill){
      return 0;
    }
    let initialNet=bill?.summary?.totalNet ?? 0;
    if (bill?.orderType === OrderLocationType.DineIn && bill?.place.placeType === SpaceTypeEnum.Hut) {
      let hutPrice = bill?.summary?.priceForPlace ?? 0;
      const originalHutPrice = hutPrice ?? 0;
      const net = bill?.summary?.totalNet ?? 0;
      const reservedFrom = new Date(bill?.place?.reservedFrom ?? '');
      const reservedTo = new Date(bill?.place?.reservedTo ?? '');
      const originalDiffMinutes = (reservedTo.getTime() - reservedFrom.getTime()) / 1000 / 60;
      const currentDiffMinutes = (Date.now() - reservedFrom.getTime()) / 1000 / 60;
      if (originalDiffMinutes < 10) {
        hutPrice = 0;
      } else if (originalDiffMinutes > currentDiffMinutes - 10) {
        hutPrice = hutPrice;
      } else {
        const minutePrice = hutPrice / originalDiffMinutes;
        const newHourMinutes = currentDiffMinutes % 60;
        let billedMinutes = currentDiffMinutes - newHourMinutes;
        let billedNewHourMinutes = 0;
        if (newHourMinutes >= 41) {
          billedNewHourMinutes = 60;
        } else if (newHourMinutes >= 11) {
          billedNewHourMinutes = 30;
        } else {
          billedNewHourMinutes = newHourMinutes;
        }
        billedMinutes += billedNewHourMinutes;
        hutPrice = billedMinutes * minutePrice;
      }
      initialNet = net + hutPrice - originalHutPrice;
    }
    const netReturnOrder = bill?.summary?.netReturnOrder ?? 0;
    return initialNet - netReturnOrder;
  }
}
