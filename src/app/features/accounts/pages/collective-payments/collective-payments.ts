import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Debounce } from '@/directives/debounce';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { SortDirection } from '@/core';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { ButtonDirective } from 'primeng/button';
import { Listbox } from 'primeng/listbox';
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
    Debounce,
    DatePipe,
    Menu,
    RouterLink,
    ButtonDirective,
    Listbox,
  ],
  templateUrl: './collective-payments.html',
  styleUrl: './collective-payments.css',
})
export class CollectivePayments extends BaseComponent {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<PaymentVoucherSearchEnum>(PaymentVoucherSearchEnum.Id, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(this.dateNowIso, [Validators.required]),
  };

  fg = this.fb.group(this.initialSearchFormValue);
  paymentVoucherService = inject(PaymentVoucherService);

  filterMenuItems = [
    { label: 'رقم السند',     value: PaymentVoucherSearchEnum.Id },
    { label: 'الرقم الدفتري', value: PaymentVoucherSearchEnum.VoucherNo },
  ];

  private _filterValue = toSignal(this.fg.controls.searchEnum.valueChanges, {
    initialValue: this.fg.controls.searchEnum.value!,
  });

  /** Dynamic placeholder matching the active search filter */
  searchPlaceholder = computed(() => {
    switch (this._filterValue()) {
      case PaymentVoucherSearchEnum.Id:        return 'ابحث برقم السند';
      case PaymentVoucherSearchEnum.VoucherNo: return 'ابحث بالرقم الدفتري';
      default: return 'ابحث...';
    }
  });

  /** Label shown as an inline badge inside the search box */
  activeFilterLabel = computed(() =>
    this.filterMenuItems.find((f) => f.value === this._filterValue())?.label ?? ''
  );

  collectivePayments = signal<IPaymentVoucherSearchRow[]>([]);
  paymentVouchersPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

  constructor() {
    super();
    this.searchPaymentVouchers(1);

    // Clear search term when filter type changes
    this.fg.controls.searchEnum.valueChanges.subscribe(() => {
      this.fg.controls.searchTerm.setValue('', { emitEvent: false });
    });
  }

  searchPaymentVouchers(pageIndex: number) {
    this.paymentVoucherService
      .search({
        paginationInfo: { pageIndex, pageSize: 10 },
        searchFilters: [
          {
            column: this.fg.getRawValue().searchEnum!,
            values: [this.fg.getRawValue().searchTerm],
          },
        ],
        fromDate: this.fg.getRawValue().fromDate,
        toDate: null,
        sortBy: 'Id',
        sortDirection: SortDirection.Desc,
      })
      .subscribe({
        next: (res) => {
          // Client-side fallback sort — newest (highest ID) first
          this.collectivePayments.set([...res.rows].sort((a, b) => b.id - a.id));
          this.paymentVouchersPaginationInfo = {
            pageIndex,
            totalPagesCount: res.paginationInfo.totalPagesCount,
            totalRowsCount: res.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  /** Called by p-listbox (onChange) — closes dropdown and re-searches immediately */
  onFilterSelect(filterMenu: Menu) {
    filterMenu.hide();
    this.fg.controls.searchTerm.setValue('', { emitEvent: false });
    this.searchPaymentVouchers(1);
  }

  onSubmit = () => this.fg.valid && this.searchPaymentVouchers(1);
  onPageChange = (event: PaginatorState) => this.searchPaymentVouchers(event.page! + 1);

  deleteCollectivePayment(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل أنت متأكد من حذف السند؟',
      header: 'حذف السند',
      icon: 'pi pi-info-circle',
      rejectLabel: 'إلغاء',
      rejectButtonProps: { label: 'إلغاء', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'حذف', severity: 'danger' },
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
