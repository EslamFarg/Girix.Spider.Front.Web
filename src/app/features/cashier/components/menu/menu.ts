import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputTextModule } from 'primeng/inputtext';
import { ImgFallback } from '@/directives/img-fallback';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { IMealSearchRow } from '@/features/classes/services/meal-service';
import { IProductSearchRow } from '@/features/classes/services/product-service';
import { GeneralService, ProductAndMealsSearchEnum } from '../../services/general-service';
import { Debounce } from '@/directives/debounce';
import { MenuItem } from 'primeng/api';
import { Menu as pMenu } from 'primeng/menu';
import { IGroupSearchRow } from '@/features/classes/services/group-service';
import { AllowNumbers } from '@/directives/allow-numbers';
import { ButtonDirective } from 'primeng/button';
import { RouterLink } from "@angular/router";
export interface IMenuItem {
  id: string;
  index: number;
  product: IProductSearchRow | null;
  meal: IMealSearchRow | null;
  quantity: number;
}

export interface IMenuItemAddition {
  product: IProductSearchRow;
  quantity: number;
}

export interface IOrderMenuItem {
  menuItem: IMenuItem;
  additions: IMenuItemAddition[];
}

@Component({
  selector: 'app-menu',
  imports: [
    ReactiveFormsModule,
    InputErrorMessageHandler,
    InputTextModule,
    ImgFallback,
    InputGroupAddonModule,
    Debounce,
    pMenu,
    AllowNumbers,
    ButtonDirective,
    RouterLink
],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu extends BaseComponent {
  groups = input<IGroupSearchRow[]>([]);
  menuItemChange = output<IOrderMenuItem>();

  menuItems = signal<IMenuItem[]>([]);

  selectCategory(category: { id: number; label: string }) {
    const previousCategoryId = this.menuSearchFg.getRawValue().category?.id;

    if (previousCategoryId === category.id) {
      this.menuSearchFg.patchValue({ category: null });
      return;
    }

    this.menuSearchFg.patchValue({ category });

    this.onSubmitSearch();
  }

  //
  nav = viewChild<ElementRef<HTMLElement>>('nav');
  form = viewChild<ElementRef<HTMLElement>>('form');
  itemsContainer = viewChild<ElementRef<HTMLElement>>('itemsContainer');

  ngAfterViewInit() {
    const navHeight = +(this.nav()?.nativeElement.offsetHeight ?? 0);
    const formHeight = +(this.form()?.nativeElement.offsetHeight ?? 0);
    const itemsContainerHeight = `calc(100% - ${navHeight + formHeight}px)`;
    this.itemsContainer()!.nativeElement.style.height = `${itemsContainerHeight}px`;
  }

  generalService = inject(GeneralService);

  initialMenuSearchFgValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<ProductAndMealsSearchEnum>(ProductAndMealsSearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
    category: this.fb.control<{ id: number; label: string } | null>(null, []),
  };

  menuSearchFg = this.fb.group(this.initialMenuSearchFgValue);

  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'الاسم',
      command: (event) => this.menuSearchFg.patchValue({ searchEnum: ProductAndMealsSearchEnum.Name }),
    },
    {
      label: 'الفئة',
      command: (event) => this.menuSearchFg.patchValue({ searchEnum: ProductAndMealsSearchEnum.CategoryName }),
    },
  ]);

  constructor() {
    super();

    this.searchProductsAndMeals(1);
  }

  lestPageSize = 0;
  currentPageItemIx = 0;

  previousSearchCriteria = this.menuSearchFg.getRawValue();
  isPreviousSearchCriteriaIdentical() {
    const isIdentical =
      this.previousSearchCriteria.searchTerm === this.menuSearchFg.getRawValue().searchTerm &&
      this.previousSearchCriteria.searchEnum === this.menuSearchFg.getRawValue().searchEnum &&
      this.previousSearchCriteria.category === this.menuSearchFg.getRawValue().category;

    return isIdentical;
  }

  menuItemsPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

  searchProductsAndMeals(pageIndex: number) {
    if (this.isPreviousSearchCriteriaIdentical()) {
      //handle stopping pagination if no more data
    } else {
      pageIndex = 1;
    }

    const searchFilters = [
      {
        column: this.menuSearchFg.getRawValue().searchEnum,
        values: [this.menuSearchFg.getRawValue().searchTerm],
      },
    ];

    if (this.menuSearchFg.getRawValue().category) {
      searchFilters.push({
        column: ProductAndMealsSearchEnum.CategoryId,
        values: [this.menuSearchFg.getRawValue().category!.id.toString()],
      });
    }

    this.generalService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 15,
        },
        searchFilters,
        fromDate: this.menuSearchFg.getRawValue().fromDate,
        removeDateFilter: true,
      })
      .subscribe({
        next: (res) => {
          let newItems: IMenuItem[] = [];
          const length = res.value.menuItems.rows.length + res.value.meals.rows.length;
          if (length > 0) {
            this.menuItemsPaginationInfo = {
              pageIndex,
              totalPagesCount:
                (res.value.meals.paginationInfo.totalPagesCount + res.value.menuItems.paginationInfo.totalPagesCount) /
                2,
              totalRowsCount:
                (res.value.meals.paginationInfo.totalRowsCount + res.value.menuItems.paginationInfo.totalRowsCount) / 2,
            };
          }

          newItems = newItems.concat(res.value.meals.rows.map((item, index) => this.mapMealToMenuItem(item, index)));
          newItems = newItems.concat(
            res.value.menuItems.rows.map((item, index) =>
              this.mapProductToMenuItem(item, res.value.meals.rows.length + index),
            ),
          );

 
          if (this.isPreviousSearchCriteriaIdentical() && pageIndex > 1) {
            this.menuItems.update((pre) => pre.concat(newItems));
          } else {
            this.menuItems.set(newItems);
          }

          this.previousSearchCriteria = this.menuSearchFg.getRawValue();

          const menuEl = this.itemsContainer()!.nativeElement;

          setTimeout(() => {
            const newScrollTop = menuEl.scrollHeight - menuEl.clientHeight - 2;

            menuEl.scrollTop = newScrollTop;
          }, 500);
        },
      });
  }

  mapProductToMenuItem(product: IProductSearchRow, index: number): IMenuItem {
    return {
      id: 'product-' + product.id,
      index,
      product: product,
      meal: null,
      quantity: 1,
    };
  }

  mapMealToMenuItem(meal: IMealSearchRow, index: number): IMenuItem {
    return {
      id: 'meal-' + meal.id,
      index,
      product: null,
      meal: meal,
      quantity: 1,
    };
  }

  onMenuScroll(event: Event, menuContainer: HTMLElement) {
    if (menuContainer.scrollTop + menuContainer.clientHeight >= menuContainer.scrollHeight - 1) {
      // if at bottom
      this.searchProductsAndMeals(this.menuItemsPaginationInfo.pageIndex + 1);
    }
  }

  onSubmitSearch() {
    if (this.menuSearchFg.invalid) {
      this.menuSearchFg.markAllAsTouched();
      return;
    }
    this.searchProductsAndMeals(this.menuItemsPaginationInfo.pageIndex);
  }

  addMenuItem(menuItem: IMenuItem, quantity: number) {
    this.menuItemChange.emit({ menuItem: { ...menuItem, quantity }, additions: [] });
  }

  removeMenuItem(menuItem: IMenuItem, quantity: number) {
    this.menuItemChange.emit({ menuItem: { ...menuItem, quantity: -quantity }, additions: [] });
  }
}
