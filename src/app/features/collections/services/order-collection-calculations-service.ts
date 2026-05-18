import { IOrderBillReadResponse, OrderLocationType } from '@/features/orders';
import { SpaceTypeEnum } from '@/features/replacements/services/replacements-service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OrderCollectionCalculationsService {

  calculateBillNet(bill: IOrderBillReadResponse): number {
    let billNet = bill?.summary?.totalNet ?? 0;
    if (bill?.orderType === OrderLocationType.DineIn && bill?.place.placeType === SpaceTypeEnum.Hut) {
      const toDate = new Date(bill?.place?.reservedTo);
      const fromDate = new Date(bill?.place?.reservedFrom);
      //didn't pass 10 minutes
      if (fromDate) {
        const diff = Math.abs(Date.now() - fromDate.getTime());
        const minutes = Math.floor(diff / 1000 / 60);
        
        if (minutes < 10) {
          billNet -= bill?.summary?.priceForPlace;
          console.log('billNet', billNet);
          return billNet;
        }
      }
    }
    return +(bill?.summary?.totalNet ?? 0)
  }
  
}
