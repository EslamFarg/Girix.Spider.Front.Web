import { BaseComponent, IPaginationInfo, SectionWrapper } from '@/components';
import { Component, inject, signal } from '@angular/core';
import { InventorySettlementSearchEnum, InventoryService } from '../../services/inventory-service';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { IInventorySettlementSearchRow } from '../../types/api/inventory/responses';
import { PaginatorState, Paginator } from 'primeng/paginator';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Debounce } from '@/directives/debounce';
import { InputErrorMessageHandler } from '@/yn-ng';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Menu } from 'primeng/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { InputText } from 'primeng/inputtext';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";
import { Listbox } from "primeng/listbox";
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-inventory',
  imports: [
    Paginator,
    RouterLink,
    DatePipe,
    Debounce,
    ReactiveFormsModule,
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    Menu,
    TranslatePipe,
    InputText,
    LoadingDisabledDirective,
    Listbox,
    TooltipModule
],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory extends BaseComponent {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<InventorySettlementSearchEnum>(InventorySettlementSearchEnum.InvoiceNumber, [
      Validators.required,
    ]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  inventoryService = inject(InventoryService);

  constructor() {
    super();
    this.searchInventorySettlements(1);
  }
  filterMenuItems = [
    {
      label: 'رقم التسوية',
      value:InventorySettlementSearchEnum.InvoiceNumber,
    },
    {
      label: 'رقم المرجع',
      value:InventorySettlementSearchEnum.ReferenceNumber,
    },
  ];
  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousLocalDateIso(1) },
    { label: 'اخر اسبوع', value: this.getPreviousLocalDateIso(7) },
    { label: 'اخر شهر', value: this.getPreviousLocalDateIso(30) },
    { label: 'اخر سنة', value: this.getPreviousLocalDateIso(365) },
  ];

  inventories = signal<IInventorySettlementSearchRow[]>([]);
  inventoriesPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

  searchInventorySettlements(pageIndex: number) {
    this.inventoryService
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
          this.inventories.set(res.rows);
          this.inventoriesPaginationInfo = {
            pageIndex,
            totalPagesCount: res.paginationInfo.totalPagesCount,
            totalRowsCount: res.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  onSubmit = () => this.fg.valid && this.searchInventorySettlements(1);

  onPageChange = (event: PaginatorState) => this.searchInventorySettlements(event.page! + 1);

  deleteInventory(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف التسوية',
      header: 'حذف التسوية',
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
        this.inventoryService.delete(id).subscribe({
          next: () => {
            this.searchInventorySettlements(1);
          },
        });
      },
      
    });
  }
}
