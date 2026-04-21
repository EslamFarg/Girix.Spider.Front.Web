import { BaseComponent, IPaginationInfo } from '@/components';
import { Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { InputErrorMessageHandler } from '@/yn-ng';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ControlsOf } from '@/yn-ng/types/helpers';
import { IProductSearchRow, ProductSearchEnum, ProductService } from '../../services/product-service';
import { IProductComponentsReadResponse } from '../../types/product-components/responses';
import { IUnitSearchRow, UnitSearchEnum, UnitService } from '../../services/unit-service';
import { ProductComponentsService } from '../../services/product-components-service';

interface IProductComponentFormRow {
  componentId: number | null;
  unitId: number | null;
  quantity: number | null;
  price: number | null;
}

type ProductComponentFormRowControls = ControlsOf<IProductComponentFormRow>;

@Component({
  selector: 'app-product-components-form',
  imports: [TranslatePipe, NgSelectComponent, InputErrorMessageHandler, Debounce, ReactiveFormsModule],
  templateUrl: './product-components-form.html',
  styleUrl: './product-components-form.css',
})
export class ProductComponentsForm extends BaseComponent {
  lastClickedTableRowIndex = signal<number | null>(-1);
  productService = inject(ProductService);
  productComponentsService = inject(ProductComponentsService);
  unitService = inject(UnitService);

  currentUnits= signal<Partial<IUnitSearchRow>[]>([]);

  fg = this.fb.group({
    menuItemId: this.fb.control<number | null>(null, [Validators.required]),
    components: this.fb.array<FormGroup<ProductComponentFormRowControls>>(
      [],
      [Validators.required, Validators.minLength(1)],
    ),
  });

  ngOnInit() {
    this.searchProducts(1);
  }

  //
  //
  //
  //#region product components
  //

  currentProductComponentEditRowIndex = signal<number>(-1);
  get componentsRows() {
    return this.fg.controls.components;
  }
  newProductComponentRowFg = this.createProductComponentRowFg();

  components = signal<IProductSearchRow[]>([]);
  currentComponents = signal<Partial<IProductSearchRow>[]>([]);
  isComponentsDialogVisible = signal(false);

  displayedProducts = computed(() => {
    const current = this.currentComponents();
    const products = this.components();

    if (!current.length) return products;

    const currentMap = new Map(current.map((a) => [a.id, a]));

    // Replace matching ones, keep the rest
    const merged = products.map((p) => (currentMap.has(p.id) ? { ...p, ...currentMap.get(p.id)! } : p));

    // Inject ones not present in current page
    const missing = current.filter((c) => !products.some((p) => p.id === c.id));

    // Usually best UX: current selections first
    return [...missing, ...merged];
  });

  componentsPaginationInfo: IPaginationInfo = { pageIndex: 1, totalPagesCount: 0, totalRowsCount: 0 };

  searchProducts(pageIndex: number, searchValue: string = '', searchEnum: ProductSearchEnum = ProductSearchEnum.Name) {
    this.productService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 20,
        },
        searchFilters: [
          {
            column: ProductSearchEnum.Name,
            values: [searchValue],
          },
        ],
        fromDate: null,
        removeDateFilter: true,
      })
      .subscribe({
        next: (res) => {
          if (res.value.menuItems.rows.length > 0) {
            if (pageIndex === 1) {
              this.componentProducts.set(res.value.menuItems.rows);
            } else {
              this.componentProducts.update((prev) => prev.concat(res.value.menuItems.rows));
            }
            this.componentProductsPaginationInfo = {
              pageIndex,
              totalPagesCount: res.value.menuItems.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.menuItems.paginationInfo.totalRowsCount,
            };
          }
        },
      });
  }

  openComponentsDialog = () => this.isComponentsDialogVisible.set(true);
  closeComponentsDialog = () => this.isComponentsDialogVisible.set(false);

  editProductComponentRow(rowIndex: number) {
    this.lastClickedTableRowIndex.set(rowIndex + 1);
    this.currentProductComponentEditRowIndex.set(rowIndex);
  }

  addProductComponentsRow() {
    if (this.newProductComponentRowFg.invalid) {
      this.newProductComponentRowFg.markAllAsTouched();
      return;
    }

    const rowValue = this.newProductComponentRowFg.getRawValue();
    const existingComponent = this.componentsRows.value.find((c) => c.componentId === rowValue.componentId);

    // check if the component is already added
    if (existingComponent) {
      const isComponentUnitExisting = this.componentsRows.value.find(
        (c) => existingComponent.componentId === c.componentId && existingComponent.unitId === c.unitId,
      );

      // check if the component unit is already added
      if (isComponentUnitExisting) {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'الوحدة موجودة مسبقا',
        });
        return;
      }
    }

    this.componentsRows.push(this.createProductComponentRowFg(rowValue));
    this.lastClickedTableRowIndex.set(this.componentsRows.length - 1);

    this.newProductComponentRowFg.reset();
  }

  createProductComponentRowFg(data?: IProductComponentFormRow) {
    return this.fb.group<ProductComponentFormRowControls>({
      componentId: this.fb.control<number | null>(data?.componentId ?? null, [Validators.required]),
      unitId: this.fb.control<number | null>(data?.unitId ?? null, [Validators.required]),
      quantity: this.fb.control<number | null>(data?.quantity ?? null, [Validators.required, Validators.min(1)]),
      price: this.fb.control<number | null>(data?.price ?? null, [Validators.required, Validators.min(1)]),
    });
  }

  //
  // components products
  //
  currentComponentProducts = signal<Partial<IProductSearchRow>[]>([]);
  componentProducts = signal<IProductSearchRow[]>([]);
  displayedComponentProducts = computed(() => {
    const current = this.currentComponentProducts();
    const componentProducts = this.componentProducts();

    if (!current.length) return componentProducts;

    const currentMap = new Map(current.map((a) => [a.id, a]));

    // Replace matching ones, keep the rest
    const merged = componentProducts.map((p) => (currentMap.has(p.id) ? { ...p, ...currentMap.get(p.id)! } : p));

    // Inject ones not present in current page
    const missing = current.filter((c) => !componentProducts.some((p) => p.id === c.id));

    // Usually best UX: current selections first
    return [...missing, ...merged];
  });
  componentProductsPaginationInfo: IPaginationInfo = { pageIndex: 1, totalPagesCount: 0, totalRowsCount: 0 };
  previousProductSearchValue = '';
  ProductSearchEnum = ProductSearchEnum;

  debouncedProductsSearch(event: IDebounceEvent, searchValue: string) {
    console.log(event);

    if (event.type === 'scrollToEnd') {
      this.searchProducts(this.componentProductsPaginationInfo.pageIndex + 1);
    } else {
      this.searchProducts(1, searchValue);
    }
  }
}
