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
import { PurchaseSearchEnum, PurchaseService } from '../../services/purchase-service';
import { IPurchaseSearchRow } from '../../types/api/purchases/responses';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";
import { Listbox } from "primeng/listbox";
import { TooltipModule } from 'primeng/tooltip';
import { A4PrintService } from '@/core';
import { buildPurchasePrintHtml } from '../../utils/purchase-print.util';

@Component({
  selector: 'app-purchases',
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
  templateUrl: './purchases.html',
  styleUrl: './purchases.css',
})
export class Purchases extends BaseComponent {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<PurchaseSearchEnum>(PurchaseSearchEnum.InvoiceNumber, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  purchaseService = inject(PurchaseService);
  a4PrintService = inject(A4PrintService);

  pageSize = signal(10);
  pageSizeOptions = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
  ];

  filterMenuItems = signal<MenuItem[]>([
    { label: 'رقم الفاتورة', value: PurchaseSearchEnum.InvoiceNumber },
    { label: 'الرقم الدفتري', value: PurchaseSearchEnum.ReferenceNumber },
    { label: 'اسم المورد', value: PurchaseSearchEnum.Name },
  ]);

  private _filterValue = toSignal(this.fg.controls.searchEnum.valueChanges, {
    initialValue: this.fg.controls.searchEnum.value,
  });

  searchPlaceholder = computed(() => {
    switch (this._filterValue()) {
      case PurchaseSearchEnum.InvoiceNumber:
        return 'ابحث برقم الفاتورة';
      case PurchaseSearchEnum.ReferenceNumber:
        return 'ابحث بالرقم الدفتري';
      case PurchaseSearchEnum.Name:
        return 'ابحث باسم المورد';
      default:
        return 'ابحث...';
    }
  });

  constructor() {
    super();
  }

  ngOnInit() {
    this.searchPurchases(1);
  }

  purchases = signal<IPurchaseSearchRow[]>([]);
  purchasesPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

  searchPurchases(pageIndex: number) {
    this.purchaseService
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
          this.purchases.set(res.rows);
          this.purchasesPaginationInfo = {
            pageIndex,
            totalPagesCount: res.paginationInfo.totalPagesCount,
            totalRowsCount: res.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  onSubmit = () => this.fg.valid && this.searchPurchases(1);

  onPageChange = (event: PaginatorState) => this.searchPurchases(event.page! + 1);

  onFilterSelect(filterMenu: Menu) {
    filterMenu.hide();
    this.fg.controls.searchTerm.setValue('', { emitEvent: false });
    this.searchPurchases(1);
  }

  onPageSizeChange(size: number) {
    if (!size || size === this.pageSize()) {
      return;
    }
    this.pageSize.set(size);
    this.searchPurchases(1);
  }

  printPurchase(id: number) {
    this.purchaseService.getById(id).subscribe({
      next: (invoice) => {
        this.a4PrintService.print(buildPurchasePrintHtml(invoice));
      },
    });
  }

  deletePurchase(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف فاتورة الشراء',
      header: 'حذف فاتورة الشراء',
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
        this.purchaseService.delete(id).subscribe({
          next: () => {
            this.searchPurchases(1);
          },
        });
      },
      
    });
  }
}
