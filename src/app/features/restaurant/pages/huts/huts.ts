import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Button, ButtonDirective } from 'primeng/button';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { HutSearchEnum, HutService, IHutDtoResponse, IHutRowResponse } from '../../services/hut-service';
import { AllowNumbers } from '@/directives/allow-numbers';
import { noSymbolsAllowed } from '@/lib/text-validators';
import { omitKeys } from '@/lib/helpers';
import { MenuItem } from 'primeng/api';
import { Debounce } from '@/directives/debounce';

@Component({
  selector: 'app-huts',
  imports: [
    Button,
    ReactiveFormsModule,
    InputGroupAddon,
    InputErrorMessageHandler,
    Select,
    InputTextModule,
    SectionWrapper,
    Paginator,
    AllowNumbers,
    ButtonDirective,
    Debounce,
  ],
  templateUrl: './huts.html',
  styleUrl: './huts.css',
})
export class Huts extends BaseComponent  {
  currentItem: IHutDtoResponse | null = null;

  initialHutFormValue = {
    id: this.fb.control<number>(0, []),
    name: this.fb.control<string>('', [
      noSymbolsAllowed,
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
    ]),
    pricePerHour: this.fb.control<number>(0, [Validators.required, Validators.min(1), Validators.max(1_000_000)]),
  };
  hutFg = this.fb.group(this.initialHutFormValue);

  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<HutSearchEnum>(HutSearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };

  searchFg = this.fb.group(this.initialSearchFormValue);

  hutService = inject(HutService);

  resetHutForm = () => {
    this.hutFg = this.fb.group(this.initialHutFormValue);
    this.currentItem = null;
  };

  fetchAndBindTableData(tableId: number) {
    return this.hutService.getById(tableId).subscribe({
      next: (res) => {
        this.hutFg.patchValue(res);
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
  }

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousUTCDate(1) },
    { label: 'اخر اسبوع', value: this.getPreviousUTCDate(7) },
    { label: 'اخر شهر', value: this.getPreviousUTCDate(30) },
    { label: 'اخر سنة', value: this.getPreviousUTCDate(365) },
  ];

 huts=signal<IHutRowResponse[]>([]);
  hutsPaginationInfo:IPaginationInfo={
    pageIndex:1,
    totalPagesCount:0,
    totalRowsCount:0
  }

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
          this.hutsPaginationInfo = {
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  onSearchSubmit = () => this.searchFg.valid && this.searchHuts(1);

  onPageChange = (event: PaginatorState) => this.searchHuts(event.page! + 1);

  deleteHut(id: number, event: Event) {
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

      accept: () => this.hutService.delete(id).subscribe({ next: () => this.searchHuts(1) }),
      reject: () => this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' }),
    });
  }

  onHutFormSubmit() {
    if (this.hutFg.invalid) return;

    if (this.currentItem) {
      this.hutService.update(this.hutFg.getRawValue()).subscribe({
        next: () => {
          this.searchHuts(1);
          this.resetHutForm();
        },
      });
    } else {
      this.hutService.create(omitKeys(this.hutFg.getRawValue(), ['id'])).subscribe({
        next: () => {
          this.searchHuts(1);
          this.resetHutForm();
        },
      });
    }
  }
}
