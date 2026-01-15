import { BaseComponent } from '@/components/base-component/base-component';
import { Component, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { InputTextModule } from 'primeng/inputtext';
import { ImgFallback } from '@/directives/img-fallback';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { IMealRowResponse } from '@/features/classes/services/meal-service';
import { IProductRowResponse } from '@/features/classes/services/product-service';
import { GeneralService, ProductAndMealsSearchEnum } from '../../services/general-service';
import { Debounce } from '@/directives/debounce';
import { MenuItem } from 'primeng/api';
import { Menu as pMenu } from 'primeng/menu';
import { IGroupRowResponse } from '@/features/classes/services/group-service';
export interface IMenuItem {
  id: number;
  label: string;
  category: {
    id: number;
    label: string;
  };
  price: number;
  imageUrl: string;
  index: number;
  product: IProductRowResponse | null;
  meal: IMealRowResponse | null;
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
  ],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu extends BaseComponent {
  groups=input<IGroupRowResponse[]>([]);

  filterCategories = [
    {
      id: 1,
      label: 'بيتزا',
    },
    {
      id: 2,
      label: 'أطباق ماكرونه',
    },
    {
      id: 3,
      label: 'كريبات',
    },
    {
      id: 4,
      label: 'برجر',
    },
    {
      id: 5,
      label: 'شوربه',
    },
    {
      id: 6,
      label: 'مشروبات ',
    },
  ];

  menuItems = signal<IMenuItem[]>([]);

  selectCategory(category: { id: number; label: string }) {
    const previousCategoryId = this.menuSearchFg.getRawValue().category?.id;

    if (previousCategoryId === category.id) {
      this.menuSearchFg.patchValue({ category: null });
      return;
    }

    this.menuSearchFg.patchValue({ category });
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

  searchProductsAndMeals(pageIndex: number) {
    if (!this.isPreviousSearchCriteriaIdentical()) pageIndex = 1;

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
          pageSize: 10,
        },
        searchFilters,
        fromDate: this.menuSearchFg.getRawValue().fromDate,
        removeDateFilter:true
      })
      .subscribe({
        next: (res) => {
          const newItems: IMenuItem[] = [];
          const length = res.value.menuItems.rows.length + res.value.meals.rows.length;
          this.lestPageSize = length;

          for (let index = 0; index < length; index++) {
            let newItem: IMenuItem;

            if (index % 2 == 0) {
              if (res.value.menuItems.rows.length > index / 2) {
                newItem = this.mapProductToMenuItem(res.value.menuItems.rows[index / 2], index);
              } else {
                newItem = this.mapMealToMenuItem(res.value.meals.rows[index / 2], index);
              }
            } else {
              if (res.value.meals.rows.length > index / 2) {
                newItem = this.mapMealToMenuItem(res.value.meals.rows[(index - 1) / 2], index);
              } else {
                newItem = this.mapProductToMenuItem(res.value.menuItems.rows[(index - 1) / 2], index);
              }
            }

            newItems.push(newItem);
          }

          this.paginationInfo = {
            pageIndex,
            totalPagesCount:
              (res.value.meals.paginationInfo.totalPagesCount + res.value.menuItems.paginationInfo.totalPagesCount) / 2,
            totalRowsCount:
              (res.value.meals.paginationInfo.totalRowsCount + res.value.menuItems.paginationInfo.totalRowsCount) / 2,
          };

          if (this.isPreviousSearchCriteriaIdentical()) {
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

  mapProductToMenuItem(product: IProductRowResponse, index: number): IMenuItem {
    return {
      id: product.id,
      label: product.name,
      category: {
        id: product.categoryId,
        label: product.categoryName,
      },
      index,
      imageUrl: product.images.find((image) => image.fullPath)?.fullPath!,
      price: product.price,
      product: product,
      meal: null,
    };
  }

  mapMealToMenuItem(meal: IMealRowResponse, index: number): IMenuItem {
    return {
      id: meal.id,
      label: meal.name,
      category: {
        id: meal.categoryId,
        label: meal.categoryName,
      },
      index,
      imageUrl: meal.images.find((image) => image.fullPath)?.fullPath!,
      price: meal.price,
      product: null,
      meal: meal,
    };
  }

  onMenuScroll(event: Event) {
    const menuContainer = event.target as HTMLElement;
    if (menuContainer.scrollTop + menuContainer.clientHeight >= menuContainer.scrollHeight - 1) {
      this.searchProductsAndMeals(this.paginationInfo.pageIndex + 1);
    }
  }

  onSubmitSearch() {
    if (this.menuSearchFg.invalid) {
      this.menuSearchFg.markAllAsTouched();
      return;
    }
    this.searchProductsAndMeals(this.paginationInfo.pageIndex);
  }
}
