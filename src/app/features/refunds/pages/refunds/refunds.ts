import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { RefundSearchEnum, RefundService } from '../../services/refund-service';
import { MenuItem } from 'primeng/api';
// import { OrderSearchEnum } from '../../../orders/pages/services/order-service';

@Component({
  selector: 'app-refunds',
  imports: [
    ReactiveFormsModule,
    InputErrorMessageHandler,
    InputGroupAddon,
    InputTextModule,
    SelectModule,
    PaginatorModule,
    SectionWrapper,
  ],
  templateUrl: './refunds.html',
  styleUrl: './refunds.css',
})
export class Refunds extends BaseComponent {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<RefundSearchEnum>(RefundSearchEnum.CustomerName, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  orderService = inject(RefundService);
  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'اسم العميل',
      command: (event) => this.fg.patchValue({ searchEnum: RefundSearchEnum.CustomerName }),
    },
    {
      label: 'رقم الطلب',
      command: (event) => this.fg.patchValue({ searchEnum: RefundSearchEnum.OrderNumber }),
    },
    {
      label: 'موقع الطلب',
      command: (event) => this.fg.patchValue({ searchEnum: RefundSearchEnum.OrderPlace }),
    },
    {
      label: 'نوع الطلب',
      command: (event) => this.fg.patchValue({ searchEnum: RefundSearchEnum.OrderType }),
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

  refunds = signal<any[]>([]);
  refundsPaginationInfo = signal<IPaginationInfo>({
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
          this.refunds.set(res.value.rows);
          this.refundsPaginationInfo.set({
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          });
        },
      });
  }

  onSubmit = () => this.fg.valid && this.searchOrders(1);

  first = 0;
  rows = 10;
  onPageChange = (event: PaginatorState) => this.searchOrders(event.page! + 1);
}
