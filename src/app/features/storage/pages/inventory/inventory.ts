import { BaseComponent, IPaginationInfo, SectionWrapper } from '@/components';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { InventorySettlementSearchEnum, InventoryService } from '../../services/inventory-service';
import { ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { IInventorySettlementSearchRow } from '../../types/api/inventory/responses';
import { PaginatorState, Paginator } from 'primeng/paginator';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Debounce } from '@/directives/debounce';
import { InputErrorMessageHandler } from '@/yn-ng';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Menu } from 'primeng/menu';
import { InputText } from 'primeng/inputtext';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";
import { Listbox } from "primeng/listbox";
import { TooltipModule } from 'primeng/tooltip';
import { Select } from 'primeng/select';
import { A4PrintService } from '@/core';
import { buildInventorySettlementPrintHtml } from '../../utils/inventory-settlement-print.util';

@Component({
  selector: 'app-inventory',
  imports: [
    Paginator,
    RouterLink,
    DatePipe,
    Debounce,
    ReactiveFormsModule,
    FormsModule,
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    Menu,
    InputText,
    LoadingDisabledDirective,
    Listbox,
    TooltipModule,
    Select,
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
  a4PrintService = inject(A4PrintService);

  pageSize = signal(10);
  pageSizeOptions = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
  ];

  filterMenuItems = [
    { label: 'رقم التسوية', value: InventorySettlementSearchEnum.InvoiceNumber },
    { label: 'الرقم الدفتري', value: InventorySettlementSearchEnum.ReferenceNumber },
  ];

  private _filterValue = toSignal(this.fg.controls.searchEnum.valueChanges, {
    initialValue: this.fg.controls.searchEnum.value,
  });

  searchPlaceholder = computed(() => {
    switch (this._filterValue()) {
      case InventorySettlementSearchEnum.InvoiceNumber:
        return 'ابحث برقم التسوية';
      case InventorySettlementSearchEnum.ReferenceNumber:
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
    this.searchInventorySettlements(pageIndex);
  }

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

  onFilterSelect(filterMenu: Menu) {
    filterMenu.hide();
    this.fg.controls.searchTerm.setValue('', { emitEvent: false });
    this.searchInventorySettlements(1);
  }

  onPageSizeChange(size: number) {
    if (!size || size === this.pageSize()) {
      return;
    }
    this.pageSize.set(size);
    this.searchInventorySettlements(1);
  }

  printInventorySettlement(id: number) {
    this.inventoryService.getById(id).subscribe({
      next: (settlement) => {
        this.a4PrintService.print(buildInventorySettlementPrintHtml(settlement));
      },
    });
  }

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
