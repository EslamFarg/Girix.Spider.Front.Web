import { IOrderBillReadResponse, OrderLocationType } from '@/features/orders';
import { SpaceTypeEnum } from '@/features/replacements/services/replacements-service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OrderCollectionCalculationsService {
  calculateBillNet(bill: IOrderBillReadResponse): number {
    let initialNet = bill?.summary?.totalNet ?? 0;
    let placePrice = 0;
    
    switch (bill?.orderType) {
      case OrderLocationType.DineIn:
        // if(!!isServiceFeeApplicable(bill)){
        //   console.log('service fee not applicable');
        //   let serviceFee = bill?.summary?.serviceFee ?? 0;
        //   initialNet-=serviceFee;
        // }
        switch (bill?.place.placeType) {
          case SpaceTypeEnum.Hut:
            let hutPrice = bill?.summary?.priceForPlace ?? 0;
            const originalHutPrice = hutPrice ?? 0;
            const net = bill?.summary?.totalNet ?? 0;
            const reservedFrom = new Date(bill?.place?.reservedFrom ?? '');
            const reservedTo = new Date(bill?.place?.reservedTo ?? '');
            const originalDiffMinutes = (reservedTo.getTime() - reservedFrom.getTime()) / 1000 / 60;
            const currentDiffMinutes = (Date.now() - reservedFrom.getTime()) / 1000 / 60;
            // if (originalDiffMinutes < 10) {
            //   hutPrice = 0;
            // } else
             if (originalDiffMinutes > currentDiffMinutes - 11) {
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
            placePrice = hutPrice - originalHutPrice;
            break;
          case SpaceTypeEnum.Table:
            break;
          case SpaceTypeEnum.Room:
            break;
        }
        break;
      case OrderLocationType.Takeaway:
        break;
      case OrderLocationType.PersonDelivery:
      case OrderLocationType.CompanyDelivery:
        break;
    }

    const netReturnOrder = bill?.summary?.netReturnOrder ?? 0;
    return initialNet + placePrice - netReturnOrder;
  }
}

function isServiceFeeApplicable(bill: IOrderBillReadResponse) {
  if (bill?.orderType !== OrderLocationType.DineIn) return false;

    //if past 10 minutes
      const reservedFrom = new Date(bill?.place?.reservedFrom || bill.dateTime || '');
      // const reservedTo = new Date(bill?.place?.reservedTo || '');
      // const originalDiffMinutes = (reservedTo.getTime() - reservedFrom.getTime()) / 1000 / 60;
      const currentDiffMinutes = (Date.now() - reservedFrom.getTime()) / 1000 / 60;
      console.log(currentDiffMinutes);
      return true
      if(currentDiffMinutes > 11) return true;
      else return false;
      // if (originalDiffMinutes < 10) {
      //   hutPrice = 0;
      // } else if (originalDiffMinutes > currentDiffMinutes - 10) {
      //   hutPrice = hutPrice;
      // } else {
      //   const minutePrice = hutPrice / originalDiffMinutes;
      //   const newHourMinutes = currentDiffMinutes % 60;
      //   let billedMinutes = currentDiffMinutes - newHourMinutes;
      //   let billedNewHourMinutes = 0;
      //   if (newHourMinutes >= 41) {
      //     billedNewHourMinutes = 60;
      //   } else if (newHourMinutes >= 11) {
      //     billedNewHourMinutes = 30;
      //   } else {
      //     billedNewHourMinutes = newHourMinutes;
      //   }
      // }

  // switch (bill?.place.placeType) {
  //   case SpaceTypeEnum.Hut:
      
  //     break;
  //   case SpaceTypeEnum.Table:
  //     break;
  //   case SpaceTypeEnum.Room:
  //     break;
  // }
}
