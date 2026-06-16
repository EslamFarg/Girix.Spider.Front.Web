import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { SpaceTypeEnum } from '@/features/replacements/services/replacements-service';
import { Component, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputText } from 'primeng/inputtext';
import { CollectionsService } from '../../services/collections-service';
import { TableCard } from '@/components/table-card/table-card';
import { ITableReadResponse, TableSearchEnum, ITableSearchRow } from '@/features/restaurant/services/table-service';
import { MenuItem } from 'primeng/api';
import { TableService } from '@/features/restaurant/services/table-service';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-tables',
  imports: [
    Paginator,
    InputGroupAddon,
    InputErrorMessageHandler,
    SectionWrapper,
    InputText,
    ReactiveFormsModule,
    TableCard,
    LoadingDisabledDirective,
    TooltipModule
],
  templateUrl: './tables.html',
  styleUrl: './tables.css',
})
export class Tables extends BaseComponent {
  collectionsService = inject(CollectionsService);
  openCollectionDialog = this.collectionsService.openCollectionDialog;
  ngAfterViewInit() {
    // this.countDownEles().forEach((ele) => {
    // ele.begin();
    // });
  }

  currentItem: ITableReadResponse | null = null;

  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<TableSearchEnum>(TableSearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };

  searchFg = this.fb.group(this.initialSearchFormValue);

  tableService = inject(TableService);

  resetTableForm = () => (this.currentItem = null);

  fetchAndBindTableData(tableId: number) {
    return this.tableService.getById(tableId).subscribe({
      next: (res) => {
        this.currentItem = res;
      },
    });
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

  constructor() {
    super();

    this.searchTables(1);

    effect(() => {
      const collectedIds = this.collectionsService.collectedOrderIds();
      if (collectedIds.length > 0) {
        this.tables.update((rows) =>
          rows.map((t) => (collectedIds.includes(t.orderId) ? { ...t, isAvailable: true } : t)),
        );
      }
    });

    effect(() => {
      const lastId = this.collectionsService.lastCollectedId();
      if (lastId != null) {
        this.searchTables(1);
      }
    });
  }

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousLocalDateIso(1) },
    { label: 'اخر اسبوع', value: this.getPreviousLocalDateIso(7) },
    { label: 'اخر شهر', value: this.getPreviousLocalDateIso(30) },
    { label: 'اخر سنة', value: this.getPreviousLocalDateIso(365) },
  ];

  tables = signal<ITableSearchRow[]>([]);
  tablesPaginationInfo = signal<IPaginationInfo>({
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  });
  searchTables(pageIndex: number) {
    this.tableService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 0,
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
          this.tablesPaginationInfo.set({
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          });
        },
      });
  }

  onSearchSubmit = () => this.searchFg.valid && this.searchTables(1);

  onPageChange = (event: PaginatorState) => {
    this.searchTables(event.page! + 1);
  } 
}
