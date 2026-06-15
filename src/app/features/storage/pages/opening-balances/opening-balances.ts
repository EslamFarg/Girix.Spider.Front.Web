import { Component, inject, signal } from '@angular/core';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { OpeningBalanceSearchEnum, OpeningBalanceService } from '../../services/opening-balance-service';
import { IOpeningBalanceSearchRow } from '../../types/api/opening-balances/responses';
import { DatePipe } from '@angular/common';
import { Debounce } from "@/directives/debounce";
import { Menu } from "primeng/menu";
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from "@angular/router";
import { LoadingDisabledDirective } from "@/directives/loading-disabled";
import { Listbox } from "primeng/listbox";
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-opening-balances',
  imports: [
    InputGroupAddon,
    InputErrorMessageHandler,
    Paginator,
    ReactiveFormsModule,
    InputTextModule,
    SectionWrapper,
    DatePipe,
    Debounce,
    Menu,
    TranslatePipe,
    RouterLink,
    LoadingDisabledDirective,
    Listbox,
    TooltipModule
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

  constructor() {
    super();
    this.searchOpeningBalances(1);
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
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' });
      },
    });
  }
}
