import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Select } from 'primeng/select';
import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Debounce } from '@/directives/debounce';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { PurchaseReturnSearchEnum, PurchaseReturnService } from '../../services/purchase-return-service';
import { IPurchaseReturnSearchRow } from '../../types/api/purchase-return/responses';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";
import { Listbox } from "primeng/listbox";
import { TooltipModule } from 'primeng/tooltip';
import { A4PrintService } from '@/core';
import { buildPurchaseReturnPrintHtml } from '../../utils/purchase-return-print.util';

@Component({
  selector: 'app-purchases-returns',
  imports: [
    InputErrorMessageHandler,
    InputGroupAddon,
    Paginator,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    SectionWrapper,
    DatePipe,
    Debounce,
    Menu,
    RouterLink,
    LoadingDisabledDirective,
    Listbox,
    TooltipModule,
    Select,
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
  a4PrintService = inject(A4PrintService);

  pageSize = signal(10);
  pageSizeOptions = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
  ];

  filterMenuItems = signal<MenuItem[]>([
    { label: 'رقم المرتجع', value: PurchaseReturnSearchEnum.Id },
    { label: 'رقم الفاتورة', value: PurchaseReturnSearchEnum.InvoiceNumber },
    { label: 'الرقم الدفتري', value: PurchaseReturnSearchEnum.ReferenceNumber },
    { label: 'اسم المورد', value: PurchaseReturnSearchEnum.Name },
  ]);

  private _filterValue = toSignal(this.fg.controls.searchEnum.valueChanges, {
    initialValue: this.fg.controls.searchEnum.value,
  });

  searchPlaceholder = computed(() => {
    switch (this._filterValue()) {
      case PurchaseReturnSearchEnum.Id:
        return 'ابحث برقم المرتجع';
      case PurchaseReturnSearchEnum.InvoiceNumber:
        return 'ابحث برقم الفاتورة';
      case PurchaseReturnSearchEnum.ReferenceNumber:
        return 'ابحث بالرقم الدفتري';
      case PurchaseReturnSearchEnum.Name:
        return 'ابحث باسم المورد';
      default:
        return 'ابحث...';
    }
  });

  constructor() {
    super();
  }

  ngOnInit() {
    this.searchPurchaseReturns(1);
  }

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
          pageSize: this.pageSize(),
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

  onFilterSelect(filterMenu: Menu) {
    filterMenu.hide();
    this.fg.controls.searchTerm.setValue('', { emitEvent: false });
    this.searchPurchaseReturns(1);
  }

  onPageSizeChange(size: number) {
    if (!size || size === this.pageSize()) {
      return;
    }
    this.pageSize.set(size);
    this.searchPurchaseReturns(1);
  }

  printPurchaseReturn(id: number) {
    this.purchaseReturnService.getById(id).subscribe({
      next: (ret) => {
        this.a4PrintService.print(buildPurchaseReturnPrintHtml(ret));
      },
    });
  }

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
      
    });
  }
}
