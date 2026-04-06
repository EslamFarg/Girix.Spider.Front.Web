import { Component, inject, signal } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { CollectiveReceiptForm } from '../../components/collective-receipt-form/collective-receipt-form';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { ReceiptVoucherService } from '../../services/receipt-voucher-service';
import { IReceiptVoucherCollectiveReceiptGetListRow } from '../../types';
import { AllowNumbers } from '@/directives/allow-numbers';
import { Debounce } from '@/directives/debounce';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-collective-receipts',
  imports: [
    SectionWrapper,
    ReactiveFormsModule,
    InputErrorMessageHandler,
    InputGroupAddon,
    Select,
    Paginator,
    InputText,
    AllowNumbers,
    Debounce,
    DatePipe,
    CurrencyPipe,
    TranslatePipe
  ],
  templateUrl: './collective-receipts.html',
  styleUrl: './collective-receipts.css',
})
export class CollectiveReceipts extends BaseComponent {
  
  initialSearchFormValue = {
    receiptVoucherId: this.fb.control<number | null>(null, [Validators.maxLength(100)]),
  };

  fg = this.fb.group(this.initialSearchFormValue);

  receiptVoucerService = inject(ReceiptVoucherService);

  constructor() {
    super();
    this.getList(1);
  }


  collectiveReceipts = signal<IReceiptVoucherCollectiveReceiptGetListRow[]>([]);
  receiptVouchersPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };


  getList(pageIndex: number) {
    this.receiptVoucerService
      .getList({
        criteria: { paginationInfo: { pageIndex, pageSize: 10 } },
        receiptVoucherId: this.fg.getRawValue().receiptVoucherId ?? 0,
      })
      .subscribe({
        next: (res) => {
          this.collectiveReceipts.set(res.rows);
          console.log(this.collectiveReceipts());
          this.receiptVouchersPaginationInfo = {
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
        this.receiptVoucerService.delete(id).subscribe({
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
