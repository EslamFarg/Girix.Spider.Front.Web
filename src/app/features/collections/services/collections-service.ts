import BaseService from '@/core/services/BaseService';
import { IOrderReadResponse, OrderService } from '@/features/invoices/services/order-service';
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
  isCollectionInvoiceDialogVisible = computed(() => this.currentItem() !== null);
  currentItem = signal<IOrderReadResponse | null>(null);
  orderService=inject(OrderService);

  openCollectionDialog = (orderId: number, isCollected: boolean) => {
    if (isCollected) {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'الطلب محصل' });
      return;
    }

    this.orderService.getById(orderId).subscribe({
      next: (order) => {
        this.currentItem.set(order);
      },
    });


   };

  closeCollectionInvoiceDialog() {
    this.currentItem.set(null);
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
