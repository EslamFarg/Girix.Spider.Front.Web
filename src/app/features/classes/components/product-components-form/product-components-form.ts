import { BaseComponent, IPaginationInfo } from '@/components';
import { Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { InputErrorMessageHandler, omitKeys } from '@/yn-ng';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ControlsOf } from '@/yn-ng/types/helpers';
import {
  IProductSearchRow,
  IProductSearchRowUnit,
  ProductSearchEnum,
  ProductService,
} from '../../services/product-service';
import { IProductComponentsReadResponse } from '../../types/product-components/responses';
import { IUnitSearchRow, UnitSearchEnum, UnitService } from '../../services/unit-service';
import { ProductComponentsService } from '../../services/product-components-service';
import { AllowNumbers } from '@/directives/allow-numbers';
import { ButtonDirective } from 'primeng/button';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";

interface IProductComponentFormRow {
  componentId: number | null;
  unitId: number | null;
  quantity: number | null;
  // price: number | null;
  units: IProductSearchRowUnit[];
}

type ProductComponentFormRowControls = ControlsOf<IProductComponentFormRow>;

@Component({
  selector: 'app-product-components-form',
  imports: [
    TranslatePipe,
    NgSelectComponent,
    InputErrorMessageHandler,
    Debounce,
    ReactiveFormsModule,
    AllowNumbers,
    ButtonDirective,
    LoadingDisabledDirective
],
  templateUrl: './product-components-form.html',
  styleUrl: './product-components-form.css',
})
export class ProductComponentsForm extends BaseComponent {
  lastClickedTableRowIndex = signal<number | null>(-1);
  productService = inject(ProductService);
  productComponentsService = inject(ProductComponentsService);
  unitService = inject(UnitService);

  currentUnits = signal<Partial<IUnitSearchRow>[]>([]);

  fg = this.fb.group({
    menuItemId: this.fb.control<number | null>(null, [Validators.required]),
    components: this.fb.array<FormGroup<ProductComponentFormRowControls>>(
      [],
      [Validators.required, Validators.minLength(1)],
    ),
  });
  fgListener = this.fg.controls.menuItemId.valueChanges.subscribe((menuItemId) => {
    if (menuItemId) {
      this.productComponentsService.getByProductId(menuItemId).subscribe({
        next: (res) => {
          this.fg.setControl(
            'components',
            this.fb.array<FormGroup<ProductComponentFormRowControls>>(
              res.components.map(
                (c) =>
                  this.createProductComponentRowFg({
                    componentId: c.componentId,
                    unitId: c.unitId,
                    quantity: c.quantity,
                    // price: c.price,
                    units: c.availableUnits,
                  })!,
              ),
              [Validators.required, Validators.min(1)],
            ),
          );
        },
      });
    }
  });

  ngOnInit() {
    this.searchProducts(1);
  }

  currentProductComponentEditRowIndex = signal<number>(-1);
  get componentsRows() {
    return this.fg.controls.components;
  }
  newProductComponentRowFg = this.createProductComponentRowFg();

  //
  //
  //
  //
  //
  //
  //
  //
  // utils
  //

  createProductComponentRowFg(data?: IProductComponentFormRow) {
    return this.fb.group<ProductComponentFormRowControls>({
      componentId: this.fb.control(data?.componentId ?? null, [Validators.required]),
      unitId: this.fb.control(data?.unitId ?? null, [Validators.required]),
      quantity: this.fb.control(data?.quantity ?? null, [Validators.required, Validators.min(1)]),
      // price: this.fb.control(data?.price ?? null, [Validators.required, Validators.min(1)]),
      units: this.fb.control(data?.units ?? [], [Validators.required, Validators.min(1)]),
    });
  }

  isProductComponentRowEditable(index: number) {
    return index === this.currentProductComponentEditRowIndex();
  }
  onNewProductComponentChange(event: IProductSearchRow) {
    this.newProductComponentRowFg.patchValue({
      units: event.menuItemUnits,
    });
  }

  //
  //
  //
  //
  //
  //
  //
  //
  //
  // main methods
  //

  onSubmitForm() {
    console.log(this.fg.getRawValue());
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    const fgValue = this.fg.getRawValue();

    const data = {
      menuItemId: fgValue.menuItemId,
      components: fgValue.components.map((component) => omitKeys(component, ['units'])),
    };

    this.productComponentsService.put(data).subscribe();
  }

  editProductComponentRow(rowIndex: number) {
    this.lastClickedTableRowIndex.set(rowIndex + 1);
    this.currentProductComponentEditRowIndex.set(rowIndex);
  }

  deleteProductComponentRow(rowIndex: number) {
    this.componentsRows.removeAt(rowIndex);
  }

  addProductComponentRow() {
    console.log(this.newProductComponentRowFg.value);
    if (this.newProductComponentRowFg.invalid) {
      this.newProductComponentRowFg.markAllAsTouched();
      return;
    }

    const rowValue = this.newProductComponentRowFg.getRawValue();

    // check if the (component + same unit) is already added
    const existingComponent = this.componentsRows.value.find(
      (c) => c.componentId === rowValue.componentId && c.unitId === rowValue.unitId,
    );

    if (existingComponent) {
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'الوحدة موجودة مسبقا',
      });
      return;
    }

    this.componentsRows.push(this.createProductComponentRowFg(rowValue));
    this.lastClickedTableRowIndex.set(this.componentsRows.length - 1);

    this.newProductComponentRowFg.reset();
  }

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //products
  //
  productsPaginationInfo: IPaginationInfo = { pageIndex: 1, totalPagesCount: 0, totalRowsCount: 0 };
  previousProductSearchValue = '';
  ProductSearchEnum = ProductSearchEnum;
  products = signal<IProductSearchRow[]>([]);
  currentProducts = signal<Partial<IProductSearchRow>[]>([]);
  isComponentsDialogVisible = signal(false);

  displayedProducts = computed(() => {
    const current = this.currentProducts();
    const products = this.products();

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
              this.products.set(res.value.menuItems.rows);
            } else {
              this.products.update((prev) => prev.concat(res.value.menuItems.rows));
            }
            this.productsPaginationInfo = {
              pageIndex,
              totalPagesCount: res.value.menuItems.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.menuItems.paginationInfo.totalRowsCount,
            };
          }
        },
      });
  }
  debouncedProductsSearch(event: IDebounceEvent, searchValue: string) {
    console.log(event);

    if (event.type === 'scrollToEnd') {
      this.searchProducts(this.productsPaginationInfo.pageIndex + 1);
    } else {
      this.searchProducts(1, searchValue);
    }
  }

  getUnitPrice(fgIx: number) {
    let unitPrice = 0;
    if (fgIx === -1) {
      const newRowUnits = this.newProductComponentRowFg.value.units ?? [];
      const currentUnitId = this.newProductComponentRowFg.value.unitId;
      const unit = newRowUnits?.find((u) => u.unitId === currentUnitId);
      if (unit?.isMainUnit) {
        unitPrice = unit.price;
      } else {
        const mainUnit = newRowUnits?.find((u) => u.isMainUnit);
        unitPrice = (unit?.quantity ?? 0) * (mainUnit?.price ?? 0);
      }
    } else {
      const componentsRows = this.componentsRows;
      const unitId = componentsRows.value?.[fgIx]?.unitId;
      const units = componentsRows.value?.[fgIx]?.units ?? [];
      const unit = units?.find((u) => u.unitId === unitId);
      if (unit?.isMainUnit) {
        unitPrice = unit.price;
      } else {
        const mainUnit = units?.find((u) => u.isMainUnit);
        unitPrice = (unit?.quantity ?? 0) * (mainUnit?.price ?? 0);
      }
    }

    return unitPrice;
  }
}
