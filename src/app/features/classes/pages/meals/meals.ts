import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
 import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { IMealRowResponse, MealSearchEnum, MealService } from '../../services/meal-service';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { ImgFallback } from '@/directives/img-fallback';
import { Debounce } from '@/directives/debounce';

@Component({
  selector: 'app-meals',
  imports: [
    ReactiveFormsModule,
    InputErrorMessageHandler,
    InputGroupAddon,
    InputTextModule,
    SelectModule,
    PaginatorModule,
     SectionWrapper,
    Menu,
    ImgFallback,
    Debounce,
  ],
  templateUrl: './meals.html',
  styleUrl: './meals.css',
})
export class Meals extends BaseComponent  {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<MealSearchEnum>(MealSearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  orderService = inject(MealService);
  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'الاسم',
      command: (event) => this.fg.patchValue({ searchEnum: MealSearchEnum.Name }),
    },
    {
      label: 'اسم الفئة',
      command: (event) => this.fg.patchValue({ searchEnum: MealSearchEnum.CategoryName }),
    },
  ]);

  constructor() {
    super();

    this.searchMeals(1);
  }

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousUTCDate(1) },
    { label: 'اخر اسبوع', value: this.getPreviousUTCDate(7) },
    { label: 'اخر شهر', value: this.getPreviousUTCDate(30) },
    { label: 'اخر سنة', value: this.getPreviousUTCDate(365) },
  ];

  meals = signal<IMealRowResponse[]>([]);
  mealsPaginationInfo:IPaginationInfo={
    pageIndex:1,
    totalPagesCount:0,
    totalRowsCount:0
  }

  searchMeals(pageIndex: number) {
    this.orderService
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
          this.meals.set(res.value.rows);
          this.mealsPaginationInfo = {
            pageIndex, // this.isIdenticalSearch() ? pageIndex : 1,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
            // searchEnum: this.fg.getRawValue().searchEnum,
            // searchTerm: this.fg.getRawValue().searchTerm,
            // fromDate: this.fg.getRawValue().fromDate,
            // toDate: this.fg.getRawValue().toDate,
          };
        },
      });
  }
  // isIdenticalSearch() {
  //   return (
  //     this.fg.getRawValue().searchTerm === this.paginationInfo.searchTerm &&
  //     this.fg.getRawValue().searchEnum === this.paginationInfo.searchEnum &&
  //     this.fg.getRawValue().fromDate === this.paginationInfo.fromDate &&
  //     this.fg.getRawValue().toDate === this.paginationInfo.toDate
  //   );
  // }
  onSubmit = () => this.fg.valid && this.searchMeals(1);

  onPageChange = (event: PaginatorState) => this.searchMeals(event.page! + 1);
}
