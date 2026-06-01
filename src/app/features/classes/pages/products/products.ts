import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { ImgFallback } from '@/directives/img-fallback';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { MenuItem } from 'primeng/api';
import { IProductSearchRow, ProductSearchEnum, ProductService } from '../../services/product-service';
import { Debounce } from '@/directives/debounce';
import { Menu } from 'primeng/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { Listbox } from "primeng/listbox";

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
    SectionWrapper,
    Debounce,
    Menu,
    TranslatePipe,
    LoadingDisabledDirective,
    Listbox
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
    {
      label: 'اسم المنتج',
      value: ProductSearchEnum.Name,
    },
    {
      label: 'اسم المجموعة',
      value: ProductSearchEnum.CategoryName,
    },
  ]);

  constructor() {
    super();
    this.searchProducts(1);
  }

  periodOptions = [
    { label: '\u0627\u0644\u0643\u0644', value: null },
    { label: '\u0627\u062e\u0631 \u064a\u0648\u0645', value: this.getPreviousLocalDateIso(1) },
    { label: '\u0627\u062e\u0631 \u0627\u0633\u0628\u0648\u0639', value: this.getPreviousLocalDateIso(7) },
    { label: '\u0627\u062e\u0631 \u0634\u0647\u0631', value: this.getPreviousLocalDateIso(30) },
    { label: '\u0627\u062e\u0631 \u0633\u0646\u0629', value: this.getPreviousLocalDateIso(365) },
  ];

  products = signal<IProductSearchRow[]>([]);
  productsPaginationInfo: IPaginationInfo = { pageIndex: 1, totalPagesCount: 0, totalRowsCount: 0 };

  searchProducts(pageIndex: number) {
    this.productService
      .search({
        paginationInfo: { pageIndex, pageSize: 10 },
        searchFilters: [{ column: this.fg.getRawValue().searchEnum, values: [this.fg.getRawValue().searchTerm] }],
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
      message:
        '\u0647\u0644 \u0627\u0646\u062a \u0645\u062a\u0627\u0654\u0643\u062f \u0645\u0646 \u062d\u0630\u0641 \u0627\u0644\u0645\u0646\u062a\u062c',
      header: '\u062d\u0630\u0641 \u0627\u0644\u0645\u0646\u062a\u062c',
      icon: 'pi pi-info-circle',
      rejectLabel: '\u0627\u0644\u063a\u0627\u0621',
      rejectButtonProps: { label: '\u0627\u0644\u063a\u0627\u0621', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: '\u062d\u0630\u0641', severity: 'danger' },
      accept: () => {
        this.productService.delete(id).subscribe({ next: () => this.searchProducts(1) });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: '\u0627\u0644\u063a\u0627\u0621',
          detail:
            '\u0644\u0642\u062f \u0642\u0645\u062a \u0628\u0627\u0644\u063a\u0627\u0621 \u0627\u0644\u062d\u0630\u0641',
        });
      },
    });
  }
}
