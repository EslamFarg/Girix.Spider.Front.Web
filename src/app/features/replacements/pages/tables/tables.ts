import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { ReplacementsService, SpaceTypeEnum } from '../../services/replacements-service';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { TableCard } from '@/components/table-card/table-card';
import { CountdownConfig, CountdownEvent } from 'ngx-countdown';
import {
  ITableReadResponse,
  ITableSearchRow,
  TableSearchEnum,
  TableService,
} from '@/features/restaurant/services/table-service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-tables',
  imports: [
    InputTextModule,
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    ReactiveFormsModule,
    Paginator,
    TableCard,
  ],
  templateUrl: './tables.html',
  styleUrl: './tables.css',
})
export class Tables extends BaseComponent {
  getFutureDate() {
    const date = new Date(this.dateNow);
    date.setDate(date.getDate() + 1);
    return date.toISOString();
  }
  getPastDate() {
    const date = new Date(this.dateNow);
    date.setDate(date.getDate() - 1);
    return date.toISOString();
  }

  replacementsService = inject(ReplacementsService);
  openDialog = this.replacementsService.openDialog;

  //countdown
  // countDownEles = viewChildren<CountdownComponent>('countdown');
  countdownConfig: CountdownConfig = { format: 'hh:mm:ss', leftTime: 60 * 60 * 2 };
  handleCountdownEvent(event: CountdownEvent) {}

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
  }

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousLocalDateIso(1) },
    { label: 'اخر اسبوع', value: this.getPreviousLocalDateIso(7) },
    { label: 'اخر شهر', value: this.getPreviousLocalDateIso(30) },
    { label: 'اخر سنة', value: this.getPreviousLocalDateIso(365) },
  ];

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
}
