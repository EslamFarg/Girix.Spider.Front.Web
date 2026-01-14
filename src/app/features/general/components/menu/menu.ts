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
  ],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu extends BaseComponent {
  initialSearchFormValue = {
    text: this.fb.control<string>('', [Validators.required]),
    categoryId: this.fb.control<number>(0, [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

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

  selectCategory(categoryId: number) {
    this.fg.get('categoryId')?.setValue(+categoryId);
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
  };

  menuSearchFg = this.fb.group(this.initialMenuSearchFgValue);

  constructor() {
    super();

    this.searchProductsAndMeals(1);

    // setInterval(() => {
    //   this.menuItems.update((pre) => {
    //     return pre.concat([
    //       {
    //         id: 1,
    //         label: 'بيتزا',
    //         category: {
    //           id: 1,
    //           label: 'بيتزا',
    //         },
    //         imageUrl: '/images/placeholders/menu-item.png',
    //         price: 100,
    //       },
    //     ]);
    //   });
    // }, 100);
  }

  lestPageSize = 0;
  currentPageItemIx = 0;

  searchProductsAndMeals(pageIndex: number) {
    this.generalService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 10,
        },
        searchEnum: this.menuSearchFg.getRawValue().searchEnum,
        searchValues: [this.menuSearchFg.getRawValue().searchTerm],
        fromDate: this.menuSearchFg.getRawValue().fromDate,
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
                console.log(index, 'index % 2 map Product');
                newItem = this.mapProductToMenuItem(res.value.menuItems.rows[index / 2], index);
              } else {
                console.log(index, 'index % 2 map Meal');
                newItem = this.mapMealToMenuItem(res.value.meals.rows[index / 2], index);
              }
            } else {
              if (res.value.meals.rows.length > index / 2) {
                console.log(index, ' map Meal');
                newItem = this.mapMealToMenuItem(res.value.meals.rows[(index - 1) / 2], index);
              } else {
                console.log(index, 'map Product');
                newItem = this.mapProductToMenuItem(res.value.menuItems.rows[(index - 1) / 2], index);
              }
            }

            console.log(newItem);
            newItems.push(newItem);
          }

          this.paginationInfo = {
            pageIndex,
            totalPagesCount:
              (res.value.meals.paginationInfo.totalPagesCount + res.value.menuItems.paginationInfo.totalPagesCount) / 2,
            totalRowsCount:
              (res.value.meals.paginationInfo.totalRowsCount + res.value.menuItems.paginationInfo.totalRowsCount) / 2,
          };

          this.menuItems.update((pre) => pre.concat(newItems));

          const menuEl = this.itemsContainer()!.nativeElement;
          console.log(menuEl.scrollHeight, menuEl.scrollTop, menuEl.clientHeight);
          setTimeout(() => {
            menuEl.scrollBy({
              top: menuEl.scrollHeight  - 20,
              behavior: 'smooth',
            });
          }, 1000);
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
    console.log(menuContainer.scrollHeight, menuContainer.scrollTop, menuContainer.clientHeight);
   if (menuContainer.scrollTop + menuContainer.clientHeight >= menuContainer.scrollHeight - 5) {
  console.log('end');
  this.searchProductsAndMeals(this.paginationInfo.pageIndex + 1);
}
  }

  onSubmit() {}
}
