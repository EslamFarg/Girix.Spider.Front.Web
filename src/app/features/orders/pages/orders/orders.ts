import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { IOrderBillReadResponse, IOrderRowResponse, OrderSearchEnum, OrderService } from '@/features/orders';
import { DatePipe } from '@angular/common';
import { Menu } from 'primeng/menu';
import { Button } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { Debounce } from '@/directives/debounce';
import { PrintService } from '@/features/print/services/print-service';
import { RouterLink } from '@angular/router';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-orders',
  imports: [
    ReactiveFormsModule,
    InputErrorMessageHandler,
    InputGroupAddon,
    InputTextModule,
    SelectModule,
    PaginatorModule,
    SectionWrapper,
    DatePipe,
    Menu,
    Button,
    Debounce,
    RouterLink,
    Dialog,
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders extends BaseComponent {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<OrderSearchEnum>(OrderSearchEnum.CustomerName, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(this.localDateIso, [Validators.required]),
  };

  fg = this.fb.group(this.initialSearchFormValue);

  orderService = inject(OrderService);

  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'اسم العميل',
      command: (event) => this.fg.patchValue({ searchEnum: OrderSearchEnum.CustomerName }),
    },
    {
      label: 'رقم الطلب',
      command: (event) => this.fg.patchValue({ searchEnum: OrderSearchEnum.OrderNumber }),
    },
    {
      label: 'موقع الطلب',
      command: (event) => this.fg.patchValue({ searchEnum: OrderSearchEnum.OrderPlace }),
    },
    {
      label: 'نوع الطلب',
      command: (event) => this.fg.patchValue({ searchEnum: OrderSearchEnum.OrderType }),
    },
  ]);

  constructor() {
    super();

    this.searchOrders(1);
  }

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousLocalDateIso(1) },
    { label: 'اخر اسبوع', value: this.getPreviousLocalDateIso(7) },
    { label: 'اخر شهر', value: this.getPreviousLocalDateIso(30) },
    { label: 'اخر سنة', value: this.getPreviousLocalDateIso(365) },
  ];

  orders = signal<IOrderRowResponse[]>([]);
  ordersPaginationInfo = signal<IPaginationInfo>({
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  });

  searchOrders(pageIndex: number) {
    this.orderService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 10,
        },
        searchFilters: [
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

  deleteOrder(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف الطلب؟',
      header: 'حذف الطلب',
      icon: 'pi pi-info-circle',
      rejectLabel: 'الغاء',
      rejectButtonProps: {
        label: 'الغاء',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'حذف',
        severity: 'danger',
      },

      accept: () => this.orderService.delete(id).subscribe({ next: () => this.searchOrders(1) }),
      reject: () => this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' }),
    });
  }

  printService = inject(PrintService);
  currentOrderBill = signal<IOrderBillReadResponse | null>(null);
  printOrder(id: number) {
    this.orderService.getBill(id).subscribe({
      next: (order) => {
        this.currentOrderBill.set(order);
        // this.printService.printOrder(order);
        this.orderDialogVisible = true;
      },
    });
  }

  orderDialogVisible = false;

  showPaymentDialog() {
    this.orderDialogVisible = true;
  }
  getOrderItem(item: IOrderBillReadResponse['items'][0]) {
    if (item.mealId) {
      return {
        name: item.name,
        quantity: item.qty,
        net: item.netUnitPriceWithTax,
      };
    } else {
      return {
        name: item.name,
        quantity: item.qty,
        net: item.netUnitPriceWithTax,
      };
    }
  }
}
