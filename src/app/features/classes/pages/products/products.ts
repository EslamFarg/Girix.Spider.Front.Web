import { BaseComponent } from '@/components/base-component/base-component';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { ImgFallback } from '@/directives/img-fallback';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProductsNav } from '../../components/products-nav/products-nav';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { MenuItem } from 'primeng/api';
import { IProductRowResponse, ProductSearchEnum, ProductService } from '../../services/product-service';
import { Debounce } from '@/directives/debounce';
import { Menu } from "primeng/menu";

@Component({
  selector: 'app-products',
  imports: [
    ReactiveFormsModule,
    InputErrorMessageHandler,
    InputGroupAddon,
    InputTextModule,
    SelectModule,
    PaginatorModule,
    ImgFallback,
    RouterLink,
    RouterLinkActive,
    ProductsNav,
    SectionWrapper,
    Debounce,
    Menu
],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products extends BaseComponent<IProductRowResponse> {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<ProductSearchEnum>(ProductSearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  orderService = inject(ProductService);
  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'الاسم',
      command: (event) => this.fg.patchValue({ searchEnum: ProductSearchEnum.Name }),
    },
    {
      label: 'اسم الفئة',
      command: (event) => this.fg.patchValue({ searchEnum: ProductSearchEnum.CategoryName }),
    },
  ]);

  constructor() {
    super();

    this.searchProducts(1);
  }

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousUTCDate(1) },
    { label: 'اخر اسبوع', value: this.getPreviousUTCDate(7) },
    { label: 'اخر شهر', value: this.getPreviousUTCDate(30) },
    { label: 'اخر سنة', value: this.getPreviousUTCDate(365) },
  ];

  searchProducts(pageIndex: number) {
    this.orderService
      .search(
        {
          pageIndex: pageIndex,
          pageSize: 10,
        },
        this.fg.getRawValue().searchEnum,
        [this.fg.getRawValue().searchTerm],
        this.fg.getRawValue().fromDate,
        this.fg.getRawValue().toDate
      )
      .subscribe({
        next: (res) => {
          this.items.set(res.value.rows);
          this.paginationInfo = {
            pageIndex: pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  onSubmit = () => this.fg.valid && this.searchProducts(1);

  first = 0;
  rows = 10;
  onPageChange = (event: PaginatorState) => this.searchProducts(event.page! + 1);
}
