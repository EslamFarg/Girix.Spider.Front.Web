import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { CountdownConfig, CountdownEvent, CountdownComponent } from 'ngx-countdown';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { CollectionsService } from '../../services/collections-service';
import { InputText } from 'primeng/inputtext';
import { HutCard } from '@/components/hut-card/hut-card';
import { IHutReadResponse, HutSearchEnum, HutService, IHutSearchRow } from '@/features/restaurant/services/hut-service';
import { MenuItem } from 'primeng/api';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";

@Component({
  selector: 'app-huts',
  imports: [
    CountdownComponent,
    Paginator,
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    ReactiveFormsModule,
    InputText,
    HutCard,
    LoadingDisabledDirective
],
  templateUrl: './huts.html',
  styleUrl: './huts.css',
})
export class Huts extends BaseComponent {
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

  collectionsService = inject(CollectionsService);
  openCollectionDialog = this.collectionsService.openCollectionDialog;

  //countdown
  // countDownEles = viewChildren<CountdownComponent>('countdown');
  countdownConfig: CountdownConfig = { format: 'hh:mm:ss', leftTime: 60 * 60 * 2 };
  handleCountdownEvent(event: CountdownEvent) {}

  ngAfterViewInit() {
    // this.countDownEles().forEach((ele) => {
    // ele.begin();
    // });
  }

  currentItem: IHutReadResponse | null = null;

  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<HutSearchEnum>(HutSearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };

  searchFg = this.fb.group(this.initialSearchFormValue);

  hutService = inject(HutService);

  resetHutForm = () => (this.currentItem = null);

  fetchAndBindTableData(tableId: number) {
    return this.hutService.getById(tableId).subscribe({
      next: (res) => {
        this.currentItem = res;
      },
    });
  }

  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'الاسم',
      command: (event) => this.searchFg.patchValue({ searchEnum: HutSearchEnum.Name }),
    },
    {
      label: 'متاح',
      command: (event) => this.searchFg.patchValue({ searchEnum: HutSearchEnum.IsAvaliable }),
    },
  ]);

  constructor() {
    super();

    this.searchHuts(1);

    effect(() => {
      const collectedIds = this.collectionsService.collectedOrderIds();
      if (collectedIds.length > 0) {
        this.huts.update((rows) =>
          rows.map((h) => (collectedIds.includes(h.orderId) ? { ...h, isAvailable: true } : h)),
        );
      }
    });

    effect(() => {
      const lastId = this.collectionsService.lastCollectedId();
      if (lastId != null) {
        this.searchHuts(1);
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

  huts = signal<IHutSearchRow[]>([]);
  hutsPaginationInfo = signal<IPaginationInfo>({
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  });
  searchHuts(pageIndex: number) {
    this.hutService
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
          this.huts.set(res.value.rows);
          this.hutsPaginationInfo.set({
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          });
        },
      });
  }

  onSearchSubmit = () => this.searchFg.valid && this.searchHuts(1);

  onPageChange = (event: PaginatorState) => this.searchHuts(event.page! + 1);
}
