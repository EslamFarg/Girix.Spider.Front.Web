import BaseService from '@/core/services/BaseService';
import { IOrderBillReadResponse, IOrderReadResponse, OrderLocationType, OrderService } from '@/features/orders';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface ICollectionRequest {
  orderId: number;
  cashPaymentAmount: number;
  networkPaymentAmount: number;
  collectionDate: string;
}
interface IDeliveryOrder {
  orderId: number;
  orderNumber: string;
  cashPayment: number;
  networkPayment: number;
  netOrder: number;
  netReturnOrder: number;
}

interface IOpenCollectionDialogOpts {
  orderId: number;
  isCollected: boolean;
  orderType:  OrderLocationType;
  deliveryId: number;
  singleOrder: boolean;
}
export interface ICollectionPersonDeliveryRequest {
  deliveryId: number;
  collectionDate: string;
  orderIds: number[];
  cashPaymentAmount: number;
  networkPaymentAmount: number;
}
export interface ICollectionCompanyDeliveryRequest {
  companyId: number;
  collectionDate: string;
  orderIds: number[];
  cashPaymentAmount: number;
  networkPaymentAmount: number;
}

@Injectable({
  providedIn: 'root',
})
export class CollectionsService extends BaseService {
  override apiRoute = 'OrderCollections';

  isCollectionInvoiceDialogVisible = computed(
    () => this.currentBill() !== null || this.currentDeliveryOrders().length > 0,
  );
  isDeliveryDialog = computed(() => this.currentDeliveryOrders().length > 0);
  currentBill = signal<IOrderBillReadResponse | null>(null);
  currentDeliveryOrders = signal<IDeliveryOrder[]>([]);
  orderService = inject(OrderService);
  lastCollectedId = signal<number | null>(null);
  collectionCompleted$ = new Subject<void>();
  currentOrderType = signal<OrderLocationType | null>(null);
  currentDeliveryId = signal<number | null>(null);
  currentOrderId = signal<number | null>(null);
  collectedOrderIds = signal<number[]>([]);

  openCollectionDialog = (
    opts: Partial<IOpenCollectionDialogOpts & Pick<IOpenCollectionDialogOpts, 'orderType'>> = {
      isCollected: false,
    },
  ) => {
    console.log(opts);
    if (opts.isCollected)
      return this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'هذا الطلب محصل بالفعل' });

    this.currentOrderType.set(opts?.orderType ?? null);
    this.currentDeliveryId.set(opts?.deliveryId ?? null);
    this.currentOrderId.set(opts?.orderId ?? null);
    this.collectedOrderIds.set([]);
    //
    //
    //

    if (opts.singleOrder) {
      this.orderService.getBill(opts.orderId!).subscribe({
        next: (bill) => {
          this.currentBill.set(bill);
        },
      });
      return;
    }

    switch (opts.orderType) {
      case OrderLocationType.PersonDelivery:
        this.getOrdersForDelivery(opts.deliveryId!).subscribe({
          next: (orders) => {
            this.currentDeliveryOrders.set(orders);
            if(orders.length==0){
              this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'لا يوجد طلبات لهذا الدليفري' });
            }
          },
        });
        break;
      case OrderLocationType.CompanyDelivery:
        this.getOrdersForCompany(opts.deliveryId!).subscribe({
          next: (orders) => {
            console.log("fetched CompanyDelivery orders",orders);
            this.currentDeliveryOrders.set(orders);
          },
        });
        break;
      case null:
      default:
        this.orderService.getBill(opts.orderId!).subscribe({
          next: (bill) => {
            this.currentBill.set(bill);
          },
        });
        break;
    }
  };

  closeCollectionInvoiceDialog() {
    this.currentBill.set(null);
    this.currentDeliveryOrders.set([]);
  }

  //
  //
  //
  //
  //
  //endpoints
  //
  //

  collectNonDelivery = (dto: ICollectionRequest) => this.http.post<any>(`${this.apiUrl}/collect`, dto);

  ///v1/OrderCollections/collectDelivery
  collectPersonDelivery = (dto: ICollectionPersonDeliveryRequest) =>
    this.http.post<any>(`${this.apiUrl}/collectDelivery`, dto);

  ///v1/OrderCollections/collectCompany
  collectCompanyDelivery = (dto: ICollectionCompanyDeliveryRequest) =>
    this.http.post<any>(`${this.apiUrl}/collectCompany`, dto);

  ///v1/OrderCollections/OrdersForDelivery
  getOrdersForDelivery = (deliveryId: number) =>
    this.http.get<IDeliveryOrder[]>(`${this.apiUrl}/OrdersForDelivery?deliveryId=${deliveryId}`);

  //v1/OrderCollections/OrdersForCompany

  getOrdersForCompany = (companyId: number) =>
    this.http.get<IDeliveryOrder[]>(`${this.apiUrl}/OrdersForCompany?companyId=${companyId}`);
}
