import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { AllowNumbers } from '@/directives/allow-numbers';
import { Debounce } from '@/directives/debounce';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { MenuItem } from 'primeng/api';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { PaymentVoucherSearchEnum, PaymentVoucherService } from '../../services/payment-voucher-service';
import { IPaymentVoucherSearchRow } from '../../types';

@Component({
  selector: 'app-collective-payments',
  imports: [
    ReactiveFormsModule,
    InputErrorMessageHandler,
    InputGroupAddon,
    Paginator,
    InputText,
    AllowNumbers,
    Debounce,
    DatePipe,
    CurrencyPipe,
    TranslatePipe,
    Menu,
    RouterLink,
  ],
  templateUrl: './collective-payments.html',
  styleUrl: './collective-payments.css',
})
export class CollectivePayments extends BaseComponent {
  rows = 10;

  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<PaymentVoucherSearchEnum>(PaymentVoucherSearchEnum.Id, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };

  fg = this.fb.group(this.initialSearchFormValue);
  paymentVoucherService = inject(PaymentVoucherService);

  filterMenuItems: MenuItem[] = [
    {
      label: 'رقم القيد',
      command: () => this.fg.patchValue({ searchEnum: PaymentVoucherSearchEnum.Id }),
    },
    {
      label: 'الرقم الدفتري',
      command: () => this.fg.patchValue({ searchEnum: PaymentVoucherSearchEnum.VoucherNo }),
    },
  ];

  collectivePayments = signal<IPaymentVoucherSearchRow[]>([]);
  paymentVouchersPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

  constructor() {
    super();
    this.searchPaymentVouchers(1);
  }

  searchPaymentVouchers(pageIndex: number) {
    this.paymentVoucherService
      .search({
        paginationInfo: {
          pageIndex,
          pageSize: this.rows,
        },
        searchFilters: [
          {
            column: this.fg.getRawValue().searchEnum!,
            values: [this.fg.getRawValue().searchTerm],
          },
        ],
        fromDate: this.fg.getRawValue().fromDate,
      })
      .subscribe({
        next: (res) => {
          this.collectivePayments.set(res.rows);
          this.paymentVouchersPaginationInfo = {
            pageIndex,
            totalPagesCount: res.paginationInfo.totalPagesCount,
            totalRowsCount: res.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  onSubmit = () => this.fg.valid && this.searchPaymentVouchers(1);

  onPageChange = (event: PaginatorState) => this.searchPaymentVouchers(event.page! + 1);

  deleteCollectivePayment(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل أنت متأكد من حذف القيد؟',
      header: 'حذف القيد',
      icon: 'pi pi-info-circle',
      rejectLabel: 'إلغاء',
      rejectButtonProps: {
        label: 'إلغاء',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'حذف',
        severity: 'danger',
      },
      accept: () => {
        this.paymentVoucherService.delete(id).subscribe({
          next: () => {
            this.searchPaymentVouchers(1);
          },
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'إلغاء', detail: 'تم إلغاء الحذف' });
      },
    });
  }
}
