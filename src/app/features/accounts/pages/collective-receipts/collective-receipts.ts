import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { ReceiptVoucherSearchEnum, ReceiptVoucherService } from '../../services/receipt-voucher-service';
import { IReceiptVoucherSearchRow } from '../../types';
import { Debounce } from '@/directives/debounce';
import { DatePipe } from '@angular/common';
import { Menu } from 'primeng/menu';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Listbox } from 'primeng/listbox';
import { SortDirection } from '@/core';

@Component({
  selector: 'app-collective-receipts',
  imports: [
    SectionWrapper,
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
  templateUrl: './collective-receipts.html',
  styleUrl: './collective-receipts.css',
})
export class CollectiveReceipts extends BaseComponent {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<ReceiptVoucherSearchEnum>(ReceiptVoucherSearchEnum.Id, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(this.dateNowIso, [Validators.required]),
  };

  fg = this.fb.group(this.initialSearchFormValue);
  receiptVoucherService = inject(ReceiptVoucherService);

  filterMenuItems = [
    { label: 'رقم السند',     value: ReceiptVoucherSearchEnum.Id },
    { label: 'الرقم الدفتري', value: ReceiptVoucherSearchEnum.VoucherNo },
  ];

  private _filterValue = toSignal(this.fg.controls.searchEnum.valueChanges, {
    initialValue: this.fg.controls.searchEnum.value!,
  });

  /** Dynamic placeholder matching the active search filter */
  searchPlaceholder = computed(() => {
    switch (this._filterValue()) {
      case ReceiptVoucherSearchEnum.Id:        return 'ابحث برقم السند';
      case ReceiptVoucherSearchEnum.VoucherNo: return 'ابحث بالرقم الدفتري';
      default: return 'ابحث...';
    }
  });

  /** Label shown as an inline badge inside the search box */
  activeFilterLabel = computed(() =>
    this.filterMenuItems.find((f) => f.value === this._filterValue())?.label ?? ''
  );

  receiptVouchers = signal<IReceiptVoucherSearchRow[]>([]);
  receiptVouchersPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

  constructor() {
    super();
    this.searchReceiptVouchers(1);

    // Clear search term when filter type changes
    this.fg.controls.searchEnum.valueChanges.subscribe(() => {
      this.fg.controls.searchTerm.setValue('', { emitEvent: false });
    });
  }

  searchReceiptVouchers(pageIndex: number) {
    this.receiptVoucherService
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
        // Instruct backend to return newest first; client-side sort is the fallback
        sortBy: 'Id',
        sortDirection: SortDirection.Desc,
      })
      .subscribe({
        next: (res) => {
          // Client-side fallback sort — newest (highest ID) first
          this.receiptVouchers.set([...res.rows].sort((a, b) => b.id - a.id));
          this.receiptVouchersPaginationInfo = {
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
    this.searchReceiptVouchers(1);
  }

  onSubmit = () => this.fg.valid && this.searchReceiptVouchers(1);
  onPageChange = (event: PaginatorState) => this.searchReceiptVouchers(event.page! + 1);

  deleteReceiptVoucher(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل أنت متأكد من حذف السند؟',
      header: 'حذف السند',
      icon: 'pi pi-info-circle',
      rejectLabel: 'إلغاء',
      rejectButtonProps: { label: 'إلغاء', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'حذف', severity: 'danger' },
      accept: () => {
        this.receiptVoucherService.delete(id).subscribe({
          next: () => {
            this.searchReceiptVouchers(1);
          },
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'إلغاء', detail: 'تم إلغاء الحذف' });
      },
    });
  }
}
