import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, computed, inject, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { IOrderSearchRow, OrderLocationType, OrderSearchEnum, OrderService } from '@/features/orders';
import { Debounce } from '@/directives/debounce';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { DeliveryService, IDeliverySearchRow } from '@/features/deliveries/services/delivery-service';
import { CheckboxModule } from 'primeng/checkbox';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { Listbox } from "primeng/listbox";

@Component({
  selector: 'app-assign-to-delivery',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    InputErrorMessageHandler,
    InputGroupAddon,
    InputTextModule,
    SelectModule,
    PaginatorModule,
    SectionWrapper,
    Debounce,
    Menu,
    Button,
    Dialog,
    CheckboxModule,
    LoadingDisabledDirective,
    ButtonDirective,
    Listbox
],
  templateUrl: './assign-to-delivery.html',
  styleUrl: './assign-to-delivery.css',
})
export class AssignToDelivery extends BaseComponent {
  orderService = inject(OrderService);
  deliveryService = inject(DeliveryService);

  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<OrderSearchEnum>(OrderSearchEnum.CustomerName, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(this.localDateIso, [Validators.required]),
  };

  fg = this.fb.group(this.initialSearchFormValue);

  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'اسم العميل',
      value: OrderSearchEnum.CustomerName,
    },
    {
      label: 'رقم الطلب',
      value: OrderSearchEnum.OrderNumber,
    },
  ]);

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousLocalDateIso(1) },
    { label: 'اخر اسبوع', value: this.getPreviousLocalDateIso(7) },
    { label: 'اخر شهر', value: this.getPreviousLocalDateIso(30) },
    { label: 'اخر سنة', value: this.getPreviousLocalDateIso(365) },
  ];

  orders = signal<IOrderSearchRow[]>([]);
  ordersPaginationInfo = signal<IPaginationInfo>({
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  });

  // Selection state
  selectedOrderIds = signal<Set<number>>(new Set());

  allSelected = computed(() => {
    const ordersList = this.orders();
    const selected = this.selectedOrderIds();
    return ordersList.length > 0 && ordersList.every((o) => selected.has(o.id));
  });

  someSelected = computed(() => {
    const ordersList = this.orders();
    const selected = this.selectedOrderIds();
    return ordersList.some((o) => selected.has(o.id)) && !this.allSelected();
  });

  // Delivery selection
  deliveryDialogVisible = signal(false);
  deliveryMen = signal<IDeliverySearchRow[]>([]);
  selectedDelivery = signal<IDeliverySearchRow | null>(null);

  constructor() {
    super();
    this.searchOrders(1);
  }

  searchOrders(pageIndex: number) {
    this.orderService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 10,
        },
        searchFilters: [
          {
            column: OrderSearchEnum.OrderType,
            values: [OrderLocationType.PersonDelivery.toString(), OrderLocationType.CompanyDelivery.toString()],
          },
          {
            column: this.fg.getRawValue().searchEnum,
            values: [this.fg.getRawValue().searchTerm],
          },
        ],
        fromDate: this.fg.getRawValue().fromDate,
      })
      .subscribe({
        next: (res) => {
          this.orders.set(res.value.rows);
          this.ordersPaginationInfo.set({
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          });
        },
      });
  }

  onSubmit = () => this.fg.valid && this.searchOrders(1);
  onPageChange = (event: PaginatorState) => this.searchOrders(event.page! + 1);

  // Checkbox handlers
  toggleSelectAll() {
    const ordersList = this.orders();
    const currentSelected = this.selectedOrderIds();

    if (this.allSelected()) {
      // Deselect all on current page
      const newSet = new Set(currentSelected);
      for (const order of ordersList) {
        newSet.delete(order.id);
      }
      this.selectedOrderIds.set(newSet);
    } else {
      // Select all on current page
      const newSet = new Set(currentSelected);
      for (const order of ordersList) {
        newSet.add(order.id);
      }
      this.selectedOrderIds.set(newSet);
    }
  }

  toggleOrderSelection(orderId: number) {
    const currentSelected = this.selectedOrderIds();
    const newSet = new Set(currentSelected);
    if (newSet.has(orderId)) {
      newSet.delete(orderId);
    } else {
      newSet.add(orderId);
    }
    this.selectedOrderIds.set(newSet);
  }

  isOrderSelected(orderId: number): boolean {
    return this.selectedOrderIds().has(orderId);
  }

  // Delivery dialog
  openDeliveryDialog() {
    this.deliveryDialogVisible.set(true);
    this.searchDeliveryMen(1);
  }

  searchDeliveryMen(pageIndex: number) {
    this.deliveryService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 10,
        },
        searchFilters: [],
        fromDate: null,
      })
      .subscribe({
        next: (res) => {
          this.deliveryMen.set(res.value.rows);
        },
      });
  }

  selectDelivery(delivery: IDeliverySearchRow) {
    this.selectedDelivery.set(delivery);
    this.deliveryDialogVisible.set(false);
  }

  changeDelivery() {
    this.selectedDelivery.set(null);
    this.openDeliveryDialog();
  }

  saveAssignment() {
    const delivery = this.selectedDelivery();
    const orderIds = Array.from(this.selectedOrderIds());

    if (!delivery || orderIds.length === 0) return;

    this.orderService
      .assignOrdersToDelivery({
        deliveryId: delivery.id,
        orderIds,
      })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'تم',
            detail: 'تم تحويل الطلبات للدليفري بنجاح',
          });
          this.selectedOrderIds.set(new Set());
          this.selectedDelivery.set(null);
          this.searchOrders(1);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'حدث خطأ أثناء التحويل',
          });
        },
      });
  }
}
