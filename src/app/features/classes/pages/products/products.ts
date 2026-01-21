import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
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
import { Menu } from 'primeng/menu';

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
    Menu,
  ],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products extends BaseComponent  {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<ProductSearchEnum>(ProductSearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  productService = inject(ProductService);
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


   products = signal<IProductRowResponse[]>([]);
    productsPaginationInfo:IPaginationInfo={
      pageIndex:1,
      totalPagesCount:0,
      totalRowsCount:0
    }

  searchProducts(pageIndex: number) {
    this.productService
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
          this.products.set(res.value.menuItems.rows);
          this.productsPaginationInfo = {
            pageIndex,
            totalPagesCount: res.value.menuItems.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.menuItems.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  onSubmit = () => this.fg.valid && this.searchProducts(1);

  onPageChange = (event: PaginatorState) => this.searchProducts(event.page! + 1);

  deleteProduct(id: number, event: Event) {
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

      accept: () => {
        this.productService.delete(id).subscribe({
          next: () => {
            this.searchProducts(1);
          },
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' });
      },
    });
  }
}
