import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, computed, ElementRef, inject, input, model, output, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputTextModule } from 'primeng/inputtext';
import { ImgFallback } from '@/directives/img-fallback';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { IMealSearchRow, MealService, IMealReadResponse } from '@/features/classes/services/meal-service';
import { IProductSearchRow, ProductService, IProductReadResponse } from '@/features/classes/services/product-service';
import { ProductsAndMealsService, ProductAndMealsSearchEnum } from '@/features/orders';
import { Debounce } from '@/directives/debounce';
import { MenuItem } from 'primeng/api';
import { Menu as pMenu } from 'primeng/menu';
import { IGroupSearchRow } from '@/features/classes/services/group-service';
import { AllowNumbers } from '@/directives/allow-numbers';
import { ButtonDirective } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { GalleriaModule } from 'primeng/galleria';
import { Dialog } from 'primeng/dialog';

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
    RouterLink,
    GalleriaModule,
    Dialog,
  ],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu extends BaseComponent {
  groups = input<IGroupSearchRow[]>([]);
  menuItemChange = output<IOrderMenuItem>();
  pickedItems = input<IOrderMenuItem[]>([]);

  menuItems = signal<IMenuItem[]>([]);

  pickedItemCounts = computed(() => {
    const counts = new Map<string, number>();
    for (const item of this.pickedItems()) {
      const id = item.menuItem.id;
      counts.set(id, (counts.get(id) ?? 0) + item.menuItem.quantity);
    }
    return counts;
  });

  getItemCount(item: IMenuItem): number {
    return this.pickedItemCounts().get(item.id) ?? 0;
  }

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

  productsAndMealsService = inject(ProductsAndMealsService);
  productService = inject(ProductService);
  mealService = inject(MealService);

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

    this.productsAndMealsService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 30,
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

  currentPreviewMenuItem = signal<IMenuItem | null>(null);
  galleriaVisible = signal(false);

  images = computed(
    () => (this.currentPreviewMenuItem()?.product?.images ?? this.currentPreviewMenuItem()?.meal?.images) || [],
  );

  previewMenuItem(event: Event, menuItem: IMenuItem) {
    event.stopPropagation();
    this.currentPreviewMenuItem.set(menuItem);
    if (this.images().length > 0) {
      this.galleriaVisible.set(true);
    }
  }

  // Product / Meal detail dialog
  detailDialogVisible = signal(false);
  detailLoading = signal(false);
  currentProductDetail = signal<IProductReadResponse | null>(null);
  currentMealDetail = signal<IMealReadResponse | null>(null);

  activeDetailImageIndex = signal(0);
  detailImages = computed(() => {
    const productImages = this.currentProductDetail()?.images ?? [];
    const mealImages = this.currentMealDetail()?.images ?? [];
    return productImages.length > 0 ? productImages : mealImages;
  });
  activeDetailImage = computed(() => {
    const images = this.detailImages();
    return images[this.activeDetailImageIndex()] ?? images[0] ?? null;
  });

  openDetailDialog(event: Event, menuItem: IMenuItem) {
    event.stopPropagation();
    this.detailLoading.set(true);
    this.detailDialogVisible.set(true);
    this.currentProductDetail.set(null);
    this.currentMealDetail.set(null);
    this.activeDetailImageIndex.set(0);

    if (menuItem.product) {
      this.productService.getById(menuItem.product.id).subscribe({
        next: (res) => {
          this.currentProductDetail.set(res);
          this.detailLoading.set(false);
        },
        error: () => this.detailLoading.set(false),
      });
    } else if (menuItem.meal) {
      this.mealService.getById(menuItem.meal.id).subscribe({
        next: (res) => {
          this.currentMealDetail.set(res);
          this.detailLoading.set(false);
        },
        error: () => this.detailLoading.set(false),
      });
    }
  }

  closeDetailDialog() {
    this.detailDialogVisible.set(false);
    this.currentProductDetail.set(null);
    this.currentMealDetail.set(null);
    this.activeDetailImageIndex.set(0);
  }
}

/*
<!-- quantity editor -->
          <div class="flex items-center gap-2 w-full justify-between">
            <!-- add -->
            <button
              (click)="addMenuItem(item, +quantity.value)"
              type="button"
              pButton
              class="p-1.5! border-0! leading-none rounded flex items-center justify-center cursor-pointer"
              style="
                --p-button-primary-background: var(--color-text-gray);
                --p-button-primary-color: var(--color-text-lighter);
              "
            >
              <i class="pi pi-plus text-[8px]!"></i>
            </button>
            <!-- quantity -->
            <input
              class="text-xs font-bold flex-1 w-full text-center outline-none no-input-spinner"
              #quantity
              appAllowNumbers
              type="number"
              [min]="1"
              [max]="1000"
              [defaultValue]="1"
            />
            <!-- remove -->
            <button
              (click)="removeMenuItem(item, +quantity.value)"
              type="button"
              pButton
              class="p-1.5! border-0! leading-none rounded flex items-center justify-center cursor-pointer"
              style="
                --p-button-primary-background: var(--color-text-gray);
                --p-button-primary-color: var(--color-text-lighter);
                --p-button-primary-hover-background: red;
                --p-button-primary-active-background: rgba(255, 0, 0, 0.538);
              "
            >
              <i class="pi pi-minus text-[8px]!"></i>
            </button>
          </div>
*/
