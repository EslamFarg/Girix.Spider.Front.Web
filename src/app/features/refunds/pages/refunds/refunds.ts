import { DatePipe } from '@angular/common';
import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Debounce } from '@/directives/debounce';
import { IRefundSearchRow, RefundSearchEnum, RefundService } from '@/features/refunds';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { RouterLink } from "@angular/router";

@Component({
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
    Debounce,
    RouterLink,
  ],
  templateUrl: './refunds.html',
  styleUrl: './refunds.css',
})
export class Refunds extends BaseComponent {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<RefundSearchEnum>(RefundSearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(this.localDateIso, [Validators.required]),
  };

  fg = this.fb.group(this.initialSearchFormValue);

  refundService = inject(RefundService);

  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'اسم العميل',
      command: () => this.fg.patchValue({ searchEnum: RefundSearchEnum.Name }),
    },
    {
      label: 'رقم الفاتورة',
      command: () => this.fg.patchValue({ searchEnum: RefundSearchEnum.InvoiceNumber }),
    },
    {
      label: 'رقم المرجع',
      command: () => this.fg.patchValue({ searchEnum: RefundSearchEnum.ReferenceNumber }),
    },
  ]);

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousLocalDateIso(1) },
    { label: 'اخر اسبوع', value: this.getPreviousLocalDateIso(7) },
    { label: 'اخر شهر', value: this.getPreviousLocalDateIso(30) },
    { label: 'اخر سنة', value: this.getPreviousLocalDateIso(365) },
  ];

  refunds = signal<IRefundSearchRow[]>([]);
  refundsPaginationInfo = signal<IPaginationInfo>({
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  });

  constructor() {
    super();
    this.searchRefunds(1);
  }

  searchRefunds(pageIndex: number) {
    this.refundService
      .search({
        paginationInfo: {
          pageIndex,
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
          const payload = 'value' in (res as object) ? (res as { value?: any }).value : res;
          const rows = payload?.rows ?? [];
          const paginationInfo = payload?.paginationInfo;

          this.refunds.set(rows);
          this.refundsPaginationInfo.set({
            pageIndex,
            totalPagesCount: paginationInfo?.totalPagesCount ?? 0,
            totalRowsCount: paginationInfo?.totalRowsCount ?? rows.length,
          });
        },
      });
  }

  onSubmit = () => this.fg.valid && this.searchRefunds(1);

  onPageChange = (event: PaginatorState) => this.searchRefunds(event.page! + 1);

  deleteRefund(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف المرتجع؟',
      header: 'حذف المرتجع',
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
      accept: () => this.refundService.delete(id).subscribe({ next: () => this.searchRefunds(1) }),
      reject: () => this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' }),
    });
  }

  getRefundDate(refund: IRefundSearchRow) {
    return refund.orderReturnDate || refund.createdAt;
  }

  getPaymentTypeLabel(refund: IRefundSearchRow) {
    if (refund.payingCash && refund.payingNetwork) {
      return 'كاش / شبكة';
    }

    if (refund.payingCash) {
      return 'كاش';
    }

    if (refund.payingNetwork) {
      return 'شبكة';
    }

    return '-';
  }
}
