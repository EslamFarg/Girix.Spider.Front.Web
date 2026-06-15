import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { IMealSearchRow, MealSearchEnum, MealService } from '../../services/meal-service';
import { Menu } from 'primeng/menu';
import { ImgFallback } from '@/directives/img-fallback';
import { Debounce } from '@/directives/debounce';
import { RouterLink } from "@angular/router";
import { LoadingDisabledDirective } from "@/directives/loading-disabled";
import { Listbox } from "primeng/listbox";
import { TooltipModule } from 'primeng/tooltip';

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
    RouterLink,
    LoadingDisabledDirective,
    Listbox,
    TooltipModule
],
  templateUrl: './meals.html',
  styleUrl: './meals.css',
})
export class Meals extends BaseComponent {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<MealSearchEnum>(MealSearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  mealService = inject(MealService);
  filterMenuItems = signal([
    {
      label: 'الاسم',
      value: MealSearchEnum.Name,
    },
    {
      label: 'اسم المجموعة',
      value: MealSearchEnum.CategoryName,
    },
  ]);

  constructor() {
    super();

    this.searchMeals(1);
  }

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousLocalDateIso(1) },
    { label: 'اخر اسبوع', value: this.getPreviousLocalDateIso(7) },
    { label: 'اخر شهر', value: this.getPreviousLocalDateIso(30) },
    { label: 'اخر سنة', value: this.getPreviousLocalDateIso(365) },
  ];

  meals = signal<IMealSearchRow[]>([]);
  mealsPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

  searchMeals(pageIndex: number) {
    this.mealService
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

  deleteMeal(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف الوجبة',
      header: 'حذف الوجبة',
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
        this.mealService.delete(id).subscribe({
          next: () => {
            this.searchMeals(1);
          },
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' });
      },
    });
  }
}
