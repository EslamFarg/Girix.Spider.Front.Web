import { Component, inject, signal } from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { ITableReadResponse, ITableSearchRow, TableSearchEnum, TableService } from '../../services/table-service';
import { noSymbolsAllowed } from '@/yn-ng/utils/text-validators';
import { omitKeys } from '@/yn-ng/utils/helpers';
import { MenuItem } from 'primeng/api';
import { Debounce } from '@/directives/debounce';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-tables',
  imports: [
    InputErrorMessageHandler,
    ReactiveFormsModule,
    InputTextModule,
    SectionWrapper,
    Paginator,
    ButtonDirective,
    Debounce,
    LoadingDisabledDirective,
    TooltipModule
],
  templateUrl: './tables.html',
  styleUrl: './tables.css',
})
export class Tables extends BaseComponent {
  currentItem: ITableReadResponse | null = null;

  initialTableFormValue = {
    id: this.fb.control<number>(0, []),
    name: this.fb.control<string>('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
      noSymbolsAllowed,
    ]),
  };

  tableFg = this.fb.group(this.initialTableFormValue);

  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<TableSearchEnum>(TableSearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(this.localDateIso, [Validators.required]),
  };

  searchFg = this.fb.group(this.initialSearchFormValue);

  tableService = inject(TableService);

  resetTableForm = () => {
    this.tableFg.reset();
    this.currentItem = null;
  };

  constructor() {
    super();

    this.searchTables(1);
  }

  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'الاسم',
      command: (event) => this.searchFg.patchValue({ searchEnum: TableSearchEnum.Name }),
    },
    {
      label: 'متاح',
      command: (event) => this.searchFg.patchValue({ searchEnum: TableSearchEnum.IsAvaliable }),
    },
  ]);

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousLocalDateIso(1) },
    { label: 'اخر اسبوع', value: this.getPreviousLocalDateIso(7) },
    { label: 'اخر شهر', value: this.getPreviousLocalDateIso(30) },
    { label: 'اخر سنة', value: this.getPreviousLocalDateIso(365) },
  ];

  fetchAndBindTableData(tableId: number) {
    return this.tableService.getById(tableId).subscribe({
      next: (res) => {
        this.tableFg.patchValue(res);
        this.currentItem = res;
      },
    });
  }

  deleteTable(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف الطاولة؟',
      header: 'حذف الطاولة',
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
        this.tableService.delete(id).subscribe({
          next: () => {
            this.searchTables(1);
          },
        });
      },
      
    });
  }

  tables = signal<ITableSearchRow[]>([]);

  tablesPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalRowsCount: 0,
    totalPagesCount: 0,
  };

  searchTables(pageIndex: number) {
    this.tableService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 10,
        },
        searchFilters: [
          {
            column: this.searchFg.getRawValue().searchEnum,
            values: [this.searchFg.getRawValue().searchTerm],
          },
        ],
        fromDate: this.searchFg.getRawValue().fromDate,
      })
      .subscribe({
        next: (res) => {
          this.tables.set(res.value.rows);
          this.tablesPaginationInfo = {
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  onSearchSubmit = () => this.searchFg.valid && this.searchTables(1);

  onPageChange = (event: PaginatorState) => this.searchTables(event.page! + 1);

  onTableFormSubmit() {
    if (this.tableFg.invalid) {
      this.tableFg.markAllAsTouched();
      return;
    }

    if (this.currentItem) {
      this.tableService.put(this.tableFg.getRawValue()).subscribe({
        next: () => {
          this.searchTables(1);
          this.resetTableForm();
        },
      });
    } else {
      this.tableService.create(omitKeys(this.tableFg.getRawValue(), ['id'])).subscribe({
        next: () => {
          this.searchTables(1);
          this.resetTableForm();
        },
      });
    }
  }
}
