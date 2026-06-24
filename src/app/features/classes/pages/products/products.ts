import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { ImgFallback } from '@/directives/img-fallback';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { IProductSearchRow, ProductSearchEnum, ProductService } from '../../services/product-service';
import { Debounce } from '@/directives/debounce';
import { TranslatePipe } from '@ngx-translate/core';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { TooltipModule } from 'primeng/tooltip';

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
    Debounce,
    TranslatePipe,
    LoadingDisabledDirective,
    TooltipModule,
    ButtonDirective,
  ],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products extends BaseComponent {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<ProductSearchEnum>(ProductSearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);
  productService = inject(ProductService);
  calculatePrice = this.productService.calculatePrice;

  filterMenuItems = signal([
    { label: 'اسم المنتج',  value: ProductSearchEnum.Name },
    { label: 'اسم المجموعة', value: ProductSearchEnum.CategoryName },
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
    this.searchProducts(1);
  }

  periodOptions = [
    { label: 'الكل',       value: null },
    { label: 'اخر يوم',   value: this.getPreviousLocalDateIso(1)   },
    { label: 'اخر اسبوع', value: this.getPreviousLocalDateIso(7)   },
    { label: 'اخر شهر',   value: this.getPreviousLocalDateIso(30)  },
    { label: 'اخر سنة',   value: this.getPreviousLocalDateIso(365) },
  ];

  products = signal<IProductSearchRow[]>([]);
  productsPaginationInfo: IPaginationInfo = { pageIndex: 1, totalPagesCount: 0, totalRowsCount: 0 };

  searchProducts(pageIndex: number) {
    const pageSize = this.pageSizeCtrl.value ?? 25;
    this.productService
      .search({
        paginationInfo: { pageIndex, pageSize },
        searchFilters: [{ column: this.fg.getRawValue().searchEnum, values: [this.fg.getRawValue().searchTerm] }],
        fromDate: this.fg.getRawValue().fromDate,
      })
      .subscribe({
        next: (res) => {
          this.products.set(res.value.menuItems.rows);
          this.productsPaginationInfo = {
            pageIndex,
            totalPagesCount: res.value.menuItems.paginationInfo.totalPagesCount,
            totalRowsCount:  res.value.menuItems.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  onSubmit        = () => this.fg.valid && this.searchProducts(1);
  onPageChange    = (event: PaginatorState) => this.searchProducts(event.page! + 1);
  onPageSizeChange() { this.searchProducts(1); }

  onFilterSelect(value: ProductSearchEnum) {
    this.fg.patchValue({ searchEnum: value });
    this.onSubmit();
  }

  onRowClick(item: IProductSearchRow) {
    this.router.navigate(['/classes/products', item.id, 'edit']);
  }

  deleteProduct(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متأكد من حذف المنتج',
      header:  'حذف المنتج',
      icon:    'pi pi-info-circle',
      rejectLabel:       'الغاء',
      rejectButtonProps: { label: 'الغاء', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'حذف',   severity: 'danger' },
      accept: () => {
        this.productService.delete(id).subscribe({ next: () => this.searchProducts(1) });
      },
    });
  }

  // ── Display range helpers ────────────────────────────────────────
  get displayRangeStart(): number {
    const { pageIndex, totalRowsCount } = this.productsPaginationInfo;
    const pageSize = this.pageSizeCtrl.value ?? 25;
    return totalRowsCount === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
  }

  get displayRangeEnd(): number {
    const { pageIndex, totalRowsCount } = this.productsPaginationInfo;
    const pageSize = this.pageSizeCtrl.value ?? 25;
    return Math.min(pageIndex * pageSize, totalRowsCount);
  }
}
