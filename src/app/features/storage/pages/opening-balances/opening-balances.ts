import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { OpeningBalanceSearchEnum, OpeningBalanceService } from '../../services/opening-balance-service';
import { IOpeningBalanceSearchRow } from '../../types/api/opening-balances/responses';
import { DatePipe } from '@angular/common';
import { Debounce } from "@/directives/debounce";
import { Menu } from "primeng/menu";
import { RouterLink } from "@angular/router";
import { LoadingDisabledDirective } from "@/directives/loading-disabled";
import { Listbox } from "primeng/listbox";
import { TooltipModule } from 'primeng/tooltip';
import { Select } from 'primeng/select';
import { A4PrintService } from '@/core';
import { buildOpeningBalancePrintHtml } from '../../utils/opening-balance-print.util';

@Component({
  selector: 'app-opening-balances',
  imports: [
    InputGroupAddon,
    InputErrorMessageHandler,
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
  templateUrl: './opening-balances.html',
  styleUrl: './opening-balances.css',
})
export class OpeningBalances extends BaseComponent {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<OpeningBalanceSearchEnum>(OpeningBalanceSearchEnum.InvoiceNumber, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  openingBalanceService = inject(OpeningBalanceService);
  a4PrintService = inject(A4PrintService);

  pageSize = signal(10);
  pageSizeOptions = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
  ];
  filterMenuItems = signal([
    {
      label: 'رقم الفاتورة',
      value: OpeningBalanceSearchEnum.InvoiceNumber,
    },
    {
      label: 'الرقم الدفتري',
      value: OpeningBalanceSearchEnum.ReferenceNumber,
    },
  ]);

  private _filterValue = toSignal(this.fg.controls.searchEnum.valueChanges, {
    initialValue: this.fg.controls.searchEnum.value,
  });

  searchPlaceholder = computed(() => {
    switch (this._filterValue()) {
      case OpeningBalanceSearchEnum.InvoiceNumber:
        return 'ابحث برقم الفاتورة';
      case OpeningBalanceSearchEnum.ReferenceNumber:
        return 'ابحث بالرقم الدفتري';
      default:
        return 'ابحث...';
    }
  });

  constructor() {
    super();
  }

  ngOnInit() {
    this.loadExplorer(1);
  }

  /** Reload explorer grid — called on init and after returning from sibling routes. */
  private loadExplorer(pageIndex: number) {
    this.searchOpeningBalances(pageIndex);
  }

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousLocalDateIso(1) },
    { label: 'اخر اسبوع', value: this.getPreviousLocalDateIso(7) },
    { label: 'اخر شهر', value: this.getPreviousLocalDateIso(30) },
    { label: 'اخر سنة', value: this.getPreviousLocalDateIso(365) },
  ];

  openingBalances = signal<IOpeningBalanceSearchRow[]>([]);
  openingBalancesPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

  searchOpeningBalances(pageIndex: number) {
    this.openingBalanceService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
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
          this.openingBalances.set(res.rows);
          this.openingBalancesPaginationInfo = {
            pageIndex,
            totalPagesCount: res.paginationInfo.totalPagesCount,
            totalRowsCount: res.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  onSubmit = () => this.fg.valid && this.searchOpeningBalances(1);

  onPageChange = (event: PaginatorState) => this.searchOpeningBalances(event.page! + 1);

  onFilterSelect(filterMenu: Menu) {
    filterMenu.hide();
    this.fg.controls.searchTerm.setValue('', { emitEvent: false });
    this.searchOpeningBalances(1);
  }

  onPageSizeChange(size: number) {
    if (!size || size === this.pageSize()) {
      return;
    }
    this.pageSize.set(size);
    this.searchOpeningBalances(1);
  }

  printOpeningBalance(id: number) {
    this.openingBalanceService.getById(id).subscribe({
      next: (invoice) => {
        this.a4PrintService.print(buildOpeningBalancePrintHtml(invoice));
      },
    });
  }

  deleteOpeningBalance(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف المنتج',
      header: 'حذف المنتج',
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
        this.openingBalanceService.delete(id).subscribe({
          next: () => {
            this.searchOpeningBalances(1);
          },
        });
      },
      
    });
  }
}
