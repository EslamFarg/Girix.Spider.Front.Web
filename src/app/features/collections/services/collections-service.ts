import BaseService from '@/core/services/BaseService';
import { IOrderBillReadResponse, IOrderReadResponse, OrderService } from '@/features/orders';
import { computed, inject, Injectable, signal } from '@angular/core';

export interface ICollectionRequest {
  orderId: number;
  cashPaymentAmount: number;
  networkPaymentAmount: number;
  collectionDate: string;
}
 
@Injectable({
  providedIn: 'root',
})
export class CollectionsService extends BaseService {
  override apiRoute = 'OrderCollections';
  isCollectionInvoiceDialogVisible = computed(() => this.currentBill() !== null);
  currentBill = signal<IOrderBillReadResponse | null>(null);
  orderService = inject(OrderService);

  openCollectionDialog = (orderBill: IOrderBillReadResponse) => {
    this.currentBill.set(orderBill);
  };

  closeCollectionInvoiceDialog() {
    this.currentBill.set(null);
  }

  //
  //
  //
  //
  //
  //endpoints
  //
  //

  collect(dto: ICollectionRequest) {
    this.http.post<any>(`${this.apiUrl}/collect`, dto);
  }
}
