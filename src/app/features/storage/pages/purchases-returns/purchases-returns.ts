import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Select } from 'primeng/select';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Debounce } from '@/directives/debounce';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { PurchaseReturnSearchEnum, PurchaseReturnService } from '../../services/purchase-return-service';
import { IPurchaseReturnSearchRow } from '../../types/api/purchase-return/responses';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";

@Component({
  selector: 'app-purchases-returns',
  imports: [
    InputErrorMessageHandler,
    InputGroupAddon,
    Select,
    Paginator,
    ReactiveFormsModule,
    InputTextModule,
    SectionWrapper,
    DatePipe,
    Debounce,
    Menu,
    TranslatePipe,
    RouterLink,
    LoadingDisabledDirective
],
  templateUrl: './purchases-returns.html',
  styleUrl: './purchases-returns.css',
})
export class PurchasesReturns extends BaseComponent {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<PurchaseReturnSearchEnum>(PurchaseReturnSearchEnum.InvoiceNumber, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  purchaseReturnService = inject(PurchaseReturnService);
  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'رقم المرتجع',
      command: () => this.fg.patchValue({ searchEnum: PurchaseReturnSearchEnum.Id }),
    },
    {
      label: 'رقم الفاتورة',
      command: () => this.fg.patchValue({ searchEnum: PurchaseReturnSearchEnum.InvoiceNumber }),
    },
    {
      label: 'الرقم الدفتري',
      command: () => this.fg.patchValue({ searchEnum: PurchaseReturnSearchEnum.ReferenceNumber }),
    },
    {
      label: 'اسم المورد',
      command: () => this.fg.patchValue({ searchEnum: PurchaseReturnSearchEnum.Name }),
    },
  ]);

  constructor() {
    super();
    this.searchPurchaseReturns(1);
  }

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousLocalDateIso(1) },
    { label: 'اخر اسبوع', value: this.getPreviousLocalDateIso(7) },
    { label: 'اخر شهر', value: this.getPreviousLocalDateIso(30) },
    { label: 'اخر سنة', value: this.getPreviousLocalDateIso(365) },
  ];

  purchaseReturns = signal<IPurchaseReturnSearchRow[]>([]);
  purchaseReturnsPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

  searchPurchaseReturns(pageIndex: number) {
    this.purchaseReturnService
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
          this.purchaseReturns.set(res.rows);
          this.purchaseReturnsPaginationInfo = {
            pageIndex,
            totalPagesCount: res.paginationInfo.totalPagesCount,
            totalRowsCount: res.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  onSubmit = () => this.fg.valid && this.searchPurchaseReturns(1);

  onPageChange = (event: PaginatorState) => this.searchPurchaseReturns(event.page! + 1);

  deletePurchaseReturn(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف مرتجع المشتريات',
      header: 'حذف مرتجع المشتريات',
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
        this.purchaseReturnService.delete(id).subscribe({
          next: () => {
            this.searchPurchaseReturns(1);
          },
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' });
      },
    });
  }
}
