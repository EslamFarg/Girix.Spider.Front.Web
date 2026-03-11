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

  openCollectionDialog = (orderId: number, isCollected: boolean = false) => {
    if (isCollected)
      return this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'هذا الطلب محصل بالفعل' });
    //
    this.orderService.getBill(orderId).subscribe({
      next: (bill) => {
        this.currentBill.set(bill);
      },
    });
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
