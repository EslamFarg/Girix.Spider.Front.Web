import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { IMealSearchRow, MealSearchEnum, MealService } from '../../services/meal-service';
import { ImgFallback } from '@/directives/img-fallback';
import { Debounce } from '@/directives/debounce';
import { RouterLink } from '@angular/router';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-meals',
  imports: [
    ReactiveFormsModule,
    InputErrorMessageHandler,
    InputGroupAddon,
    InputTextModule,
    SelectModule,
    PaginatorModule,
    ImgFallback,
    Debounce,
    RouterLink,
    LoadingDisabledDirective,
    TooltipModule,
    ButtonDirective,
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
    { label: 'اسم الوجبة',   value: MealSearchEnum.Name },
    { label: 'اسم المجموعة', value: MealSearchEnum.CategoryName },
  ]);

  // ── Page size ────────────────────────────────────────────────────
  pageSizeCtrl = this.fb.control<number>(25);
  pageSizeOptions = [
    { label: '25',  value: 25  },
    { label: '50',  value: 50  },
    { label: '100', value: 100 },
  ];

  constructor() {
    super();
    this.searchMeals(1);
  }

  meals = signal<IMealSearchRow[]>([]);
  mealsPaginationInfo: IPaginationInfo = { pageIndex: 1, totalPagesCount: 0, totalRowsCount: 0 };

  searchMeals(pageIndex: number) {
    const pageSize = this.pageSizeCtrl.value ?? 25;
    this.mealService
      .search({
        paginationInfo: { pageIndex, pageSize },
        searchFilters: [{ column: this.fg.getRawValue().searchEnum, values: [this.fg.getRawValue().searchTerm] }],
        fromDate: this.fg.getRawValue().fromDate,
      })
      .subscribe({
        next: (res) => {
          this.meals.set(res.value.rows);
          this.mealsPaginationInfo = {
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount:  res.value.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  onSubmit        = () => this.fg.valid && this.searchMeals(1);
  onPageChange    = (event: PaginatorState) => this.searchMeals(event.page! + 1);
  onPageSizeChange() { this.searchMeals(1); }

  onFilterSelect(value: MealSearchEnum) {
    this.fg.patchValue({ searchEnum: value });
    this.onSubmit();
  }

  onRowClick(item: IMealSearchRow) {
    this.router.navigate(['/classes/meals', item.id, 'edit']);
  }

  deleteMeal(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متأكد من حذف الوجبة',
      header:  'حذف الوجبة',
      icon:    'pi pi-info-circle',
      rejectLabel:       'الغاء',
      rejectButtonProps: { label: 'الغاء', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'حذف',   severity: 'danger' },
      accept: () => {
        this.mealService.delete(id).subscribe({ next: () => this.searchMeals(1) });
      },
    });
  }

  // ── Display range helpers ────────────────────────────────────────
  get displayRangeStart(): number {
    const { pageIndex, totalRowsCount } = this.mealsPaginationInfo;
    const pageSize = this.pageSizeCtrl.value ?? 25;
    return totalRowsCount === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
  }

  get displayRangeEnd(): number {
    const { pageIndex, totalRowsCount } = this.mealsPaginationInfo;
    const pageSize = this.pageSizeCtrl.value ?? 25;
    return Math.min(pageIndex * pageSize, totalRowsCount);
  }
}
