import { Component, inject, signal } from '@angular/core';
 import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { InputText } from 'primeng/inputtext';
import { PaymentVoucherService } from '../../services/payment-voucher-service';
import { IPaymentVoucherGetListRow } from '../../services/payment-voucher-types';
import { Debounce } from '@/directives/debounce';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-collective-payments',
  imports: [
     SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    Select,
    Paginator,
    ReactiveFormsModule,
    InputText,
    Debounce,
    DatePipe,
    CurrencyPipe,
    TranslatePipe
  ],
  templateUrl: './collective-payments.html',
  styleUrl: './collective-payments.css',
})
export class CollectivePayments extends BaseComponent {
  initialSearchFormValue = {
    paymentVoucherId: this.fb.control<number | null>(null, [Validators.maxLength(100)]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  periodOptions = [
    { label: 'اليوم', value: 1 },
    { label: 'الاسبوع', value: 2 },
    { label: 'الشهر', value: 3 },
    { label: 'السنة', value: 4 },
  ];



  first = 0;
  rows = 10;



  paymentVoucerService = inject(PaymentVoucherService);

  constructor() {
    super();
    this.getList(1);
  }

  collectivePayments = signal<IPaymentVoucherGetListRow[]>([]);
  paymentVouchersPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

  getList(pageIndex: number) {
    this.paymentVoucerService
      .getList({
        criteria: { paginationInfo: { pageIndex, pageSize: 10 } },
        paymentVoucherId: this.fg.getRawValue().paymentVoucherId ?? 0,
      })
      .subscribe({
        next: (res) => {
          this.collectivePayments.set(res.rows);
          console.log(this.collectivePayments());
          this.paymentVouchersPaginationInfo = {
            pageIndex,
            totalPagesCount: res.paginationInfo.totalPagesCount,
            totalRowsCount: res.paginationInfo.totalRowsCount,
          };
        },
      });
  }



  onSubmit = () => this.fg.valid && this.getList(1);

  onPageChange = (event: PaginatorState) => this.getList(event.page! + 1);

  deleteCollectiveReceipt(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف السند',
      header: 'حذف السند',
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

      accept: () => {
        this.paymentVoucerService.delete(id).subscribe({
          next: () => {
            this.getList(1);
          },
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' });
      },
    });
  }



  
}
