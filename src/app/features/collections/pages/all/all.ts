import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { CollectionsService } from '../../services/collections-service';
import { OrderSearchEnum, OrderService, IOrderRowResponse } from '@/features/invoices/services/order-service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-all',
  imports: [
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    Select,
    Paginator,
    ReactiveFormsModule,
    InputText,
    Dialog,
    Button,
  ],
  templateUrl: './all.html',
  styleUrl: './all.css',
})
export class All extends BaseComponent {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<OrderSearchEnum>(OrderSearchEnum.CustomerName, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
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
    { label: 'اخر يوم', value: this.getPreviousUTCDate(1) },
    { label: 'اخر اسبوع', value: this.getPreviousUTCDate(7) },
    { label: 'اخر شهر', value: this.getPreviousUTCDate(30) },
    { label: 'اخر سنة', value: this.getPreviousUTCDate(365) },
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

  ///
  collectionsService = inject(CollectionsService);

  openCollectionDialog = this.collectionsService.openCollectionDialog;

  isInvoiceTypeChangeDialogVisible = false;

  openInvoiceTypeChangeDialog() {
    this.isInvoiceTypeChangeDialogVisible = true;
  }

  closeInvoiceTypeChangeDialog() {
    this.isInvoiceTypeChangeDialogVisible = false;
  }
}
