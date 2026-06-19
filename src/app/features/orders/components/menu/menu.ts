import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, computed, ElementRef, inject, input, model, output, signal, viewChild, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputTextModule } from 'primeng/inputtext';
import { ImgFallback } from '@/directives/img-fallback';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { IMealSearchRow, MealService, IMealReadResponse } from '@/features/classes/services/meal-service';
import { IProductSearchRow, ProductService, IProductReadResponse } from '@/features/classes/services/product-service';
import { ProductsAndMealsService, ProductAndMealsSearchEnum, OrderService } from '@/features/orders';
import { Debounce } from '@/directives/debounce';
import { MenuItem } from 'primeng/api';
import { Menu as pMenu } from 'primeng/menu';
import { IGroupSearchRow } from '@/features/classes/services/group-service';
import { AllowNumbers } from '@/directives/allow-numbers';
import { ButtonDirective } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { GalleriaModule } from 'primeng/galleria';
import { Dialog } from 'primeng/dialog';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { Tooltip } from "primeng/tooltip";

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
    LoadingDisabledDirective,
    Tooltip
],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu extends BaseComponent implements OnDestroy {
  static readonly ALL_CATEGORY_ID = -1;

  groups = input<IGroupSearchRow[]>([]);
  menuItemChange = output<IOrderMenuItem>();
  pickedItems = input<IOrderMenuItem[]>([]);
  options =input<{continueBtn: boolean}>({continueBtn: false});
  onContinue = output<boolean>();

  menuItems = signal<IMenuItem[]>([]);

  private isLoadingMore = false;
  private hasReachedEnd = false;

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

  categoryTabs = computed(() => {
    const allTab: IGroupSearchRow = {
      id: Menu.ALL_CATEGORY_ID,
      name: 'الكل',
      printerName: '',
      isOnCasher: true,
      attachment: [],
    };
    const groups = this.groups().filter((group) => group.name !== 'الكل');
    return [allTab, ...groups];
  });

  isCategoryActive(item: IGroupSearchRow): boolean {
    const selectedCategory = this.menuSearchFg.getRawValue().category;
    if (item.id === Menu.ALL_CATEGORY_ID) {
      return selectedCategory === null;
    }
    return selectedCategory?.id === item.id;
  }

  selectCategory(category: { id: number; label: string }) {
    if (category.id === Menu.ALL_CATEGORY_ID) {
      if (this.menuSearchFg.getRawValue().category === null) {
        return;
      }

      this.menuSearchFg.patchValue({ category: null });
      this.onSubmitSearch();
      return;
    }

    const previousCategoryId = this.menuSearchFg.getRawValue().category?.id;

    if (previousCategoryId === category.id) {
      this.menuSearchFg.patchValue({ category: null });
      this.onSubmitSearch();
      return;
    }

    this.menuSearchFg.patchValue({ category });
    this.onSubmitSearch();
  }

  resetToAllCategory() {
    if (this.menuSearchFg.getRawValue().category === null) {
      return;
    }

    this.menuSearchFg.patchValue({ category: null });
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
    this.setupScrollObserver();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    const container = this.itemsContainer()?.nativeElement;
    if (container) {
      container.removeEventListener('wheel', this.onUserScrollAttempt);
      container.removeEventListener('keydown', this.onUserScrollAttempt);
      container.removeEventListener('touchmove', this.onUserScrollAttempt);
    }
  }

  private setupScrollObserver() {
    const container = this.itemsContainer()?.nativeElement;
    if (!container) return;

    // Listen for explicit user scroll attempts (wheel, touch, keyboard)
    // NOT the passive scroll event which fires continuously at bottom
    container.addEventListener('wheel', this.onUserScrollAttempt, { passive: true });
    container.addEventListener('keydown', this.onUserScrollAttempt);
    container.addEventListener('touchmove', this.onUserScrollAttempt, { passive: true });
  }

  private onUserScrollAttempt = (event: Event) => {
    if (this.isLoadingMore || this.hasReachedEnd) return;

    const container = this.itemsContainer()?.nativeElement;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;

    // Trigger when within 100px of the bottom
    const threshold = 100;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;

    if (isAtBottom) {
      this.isLoadingMore = true;
      this.loadMoreItems();
    }
  };

  private loadMoreItems() {
    const nextPage = this.menuItemsPaginationInfo.pageIndex + 1;
    // Don't load if we've reached the end
    if (nextPage > this.menuItemsPaginationInfo.totalPagesCount && this.menuItemsPaginationInfo.totalPagesCount > 0) {
      this.hasReachedEnd = true;
      this.isLoadingMore = false;
      return;
    }
    this.searchProductsAndMeals(nextPage);
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

  constructor(orderService: OrderService) {
    super();
    // orderService.reset.subscribe(() => {
    //     this.pickedItems.set([]);
    // });
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
      this.hasReachedEnd = false;
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
          const mealsPages = res.value.meals.paginationInfo.totalPagesCount;
          const itemsPages = res.value.menuItems.paginationInfo.totalPagesCount;
          console.log('[Menu Response]', { pageIndex, mealsCount: res.value.meals.rows.length, itemsCount: res.value.menuItems.rows.length, mealsPages, itemsPages });
          if (length > 0) {
            this.menuItemsPaginationInfo = {
              pageIndex,
              totalPagesCount: Math.max(mealsPages, itemsPages),
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

          this.isLoadingMore = false;
        },
        error: () => {
          this.isLoadingMore = false;
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
