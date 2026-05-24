import { Component, computed, inject, input, signal } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { BaseComponent, FormMode, IPaginationInfo } from '@/components/base-component/base-component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaginatorState } from 'primeng/paginator';
import { Button, ButtonDirective } from 'primeng/button';
import { IInventoryProductSearchRow, IInventoryReadResponse } from '../../types/api/inventory/responses';
import { InventoryProductSearchEnum, InventoryService } from '../../services/inventory-service';
import { ControlsOf } from '@/yn-ng/types/helpers';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { tap } from 'rxjs';
import { AllowNumbers } from '@/directives/allow-numbers';
import { onlyNumbersAllowed, onlyNumbersOrDotAllowed, onlyNumbersOrEnLettersAllowed } from '@/yn-ng';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";

 
 

interface IAppInventoryItem {
  itemId: number | null;
  unitId: number | null;
  systemQuantity: number | null;
  actualQuantity: number | null;
}
type IAppInventoryItemControls = ControlsOf<IAppInventoryItem>;

interface IInventorySettlementBulkSearchControls {
  quantityOption: FormControl<QuantityOptions | null>;
}

enum QuantityOptions {
  LessThanZero = 2,
  Zero = 0,
  MoreThanZero = 1,
  All = 3,
}

@Component({
  selector: 'app-inventory-settlement-form',
  imports: [
    SectionWrapper,
    InputErrorMessageHandler,
    InputTextModule,
    DatePickerModule,
    InputGroupAddon,
    ReactiveFormsModule,
    Button,
    ReactiveFormsModule,
    NgSelectComponent,
    Debounce,
    AllowNumbers,
    ButtonDirective,
    LoadingDisabledDirective
],
  templateUrl: './inventory-settlement-form.html',
  styleUrl: './inventory-settlement-form.css',
})
export class InventorySettlementForm extends BaseComponent {
  currentInventory = signal<IInventoryReadResponse | null>(null);
  inventoryService = inject(InventoryService);
  id = input<number | null>(null);
  InventoryProductSearchEnum = InventoryProductSearchEnum;
  QuantityOptions = QuantityOptions;

  formMode = computed(() => {
    if (this.currentInventory()) return FormMode.Update;
    return this.initialFormMode();
  });
  currentFormMode = signal<FormMode>(FormMode.Create);

  initialFormValue = {
    // المرجع
    referenceNumber: this.fb.control<string | null>(null, [Validators.required,Validators.maxLength(16),onlyNumbersOrEnLettersAllowed]),
    // الرقم الفاتورة
    settlementDate: this.fb.control<Date | null>(new Date(), [Validators.required]),
    items: this.fb.array<FormGroup<IAppInventoryItemControls>>([], [Validators.required, Validators.minLength(1)]),
  };
  fg = this.fb.group(this.initialFormValue);
  inventoryBulkSearchFg = this.fb.group<IInventorySettlementBulkSearchControls>({
    quantityOption: this.fb.control<QuantityOptions | null>(QuantityOptions.All),
  });

  //
  //
  //
  //
  //
  //
  //
  /**
   *
   */
  constructor() {
    super();
    this.searchInventoryProducts(1);
    this.setUpNewInventorySettlementRowFg();
  }

  ngOnInit() {
    const inventoryId = this.id();
    this.currentFormMode.set(this.formMode());

    switch (this.currentFormMode()) {
      case FormMode.Create:
        break;
      case FormMode.Update:
        this.inventoryService.getById(inventoryId!).subscribe({
          next: (data) => {
            this.loadInventorySettlement(data);
          },
        });
        break;
    }
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
  //
  //

  onSubmitInventory() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      console.log('invalid');
      console.log(this.fg.getRawValue());
      return;
    }

    const rawValue = this.fg.getRawValue();
    const data = {
      settlementDate: this.UtcToLocalIso(rawValue.settlementDate!.toISOString()),
      referenceNumber: rawValue.referenceNumber!,
      items: rawValue.items.map((item) => ({
        itemId: item.itemId!,
        unitId: item.unitId!,
        systemQuantity: item.systemQuantity!,
        actualQuantity: item.actualQuantity!,
      })),
    };

    switch (this.currentFormMode()) {
      case FormMode.Create:
        this.inventoryService.create(data).subscribe({
          next: (data) => {
            this.router.navigate(['/storage/inventory']);
          },
        });
        break;
      case FormMode.Update:
        this.inventoryService.put({ ...data, id: this.currentInventory()?.id }).subscribe();
        break;
    }
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
  //

  findInventorySettlementByNumber(invoiceNumber: string) {
    return this.inventoryService.getByNumber(invoiceNumber).pipe(
      tap({
        next: (data) => {
          this.loadInventorySettlement(data);
        },
      }),
    );
  }

  debouncedFindInventorySettlementByNumberByNumber(event: IDebounceEvent, invoiceNumber: string) {
    console.log(event);
    if (!invoiceNumber) return;

    this.findInventorySettlementByNumber(invoiceNumber).subscribe();
  }

  loadInventorySettlement(data: IInventoryReadResponse) {
    this.currentInventory.set(data);
    this.currentFormMode.set(FormMode.Update);
    this.fg.patchValue({
      referenceNumber: data.referenceNumber,
      settlementDate: new Date(data.settlementDate),
    });
    this.currentInventoryProducts.set(
      data.items.map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.systemQuantity,
        unitId: item.unitId,
        unitName: item.unitName,
      })),
    );
    this.fg.setControl(
      'items',
      this.fb.array(
        data.items.map((item) => {
          return this.createItemFg(item);
        }),
      ),
    );
    this.currentEditRowIndex.set(-1);
    this.lastClickedTableRowIndex.set(null);
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
  //
  //setting up new opening balance item
  //

  newInventorySettlementItemRowFg!: FormGroup<IAppInventoryItemControls>;

  createItemFg(data?: IAppInventoryItem) {
    return this.fb.group<IAppInventoryItemControls>({
      itemId: this.fb.control<number | null>(data?.itemId ?? null, [Validators.required]),
      unitId: this.fb.control<number | null>(data?.unitId ?? null, [Validators.required]),
      systemQuantity: this.fb.control<number | null>(data?.systemQuantity ?? null, [Validators.required,onlyNumbersOrDotAllowed]),
      actualQuantity: this.fb.control<number | null>(data?.actualQuantity ?? null, [Validators.required,onlyNumbersOrDotAllowed]),
    });
  }

  setUpNewInventorySettlementRowFg() {
    if (this.newInventorySettlementItemRowFg) {
      this.newInventorySettlementItemRowFg.reset();
    } else {
      this.newInventorySettlementItemRowFg = this.createItemFg();
    }
  }

  addNewInventorySettlementItem() {
    if (this.newInventorySettlementItemRowFg.invalid) {
      this.newInventorySettlementItemRowFg.markAllAsTouched();
      //log errors
      Object.entries(this.newInventorySettlementItemRowFg.controls!).forEach(([key, value]) => {
        if (value.errors) {
          console.log(key, value.errors);
        }
      });
      return;
    }

    const fgValue = this.newInventorySettlementItemRowFg.value;

    if (this.isInventorySettlementItemAlreadyAdded(fgValue.itemId)) {
      return this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'تمت إضافة هذا المنتج بالفعل',
      });
    }

    this.fg.controls.items!.push(this.createItemFg(fgValue as IAppInventoryItem));

    const currentInventoryProduct =
      this.products().find((product) => product.itemId === fgValue.itemId) ??
      this.currentInventoryProducts().find((product) => product.itemId === fgValue.itemId);

    if (currentInventoryProduct) {
      this.currentInventoryProducts.update((pre) => [
        ...pre.filter((product) => product.itemId !== fgValue.itemId),
        currentInventoryProduct,
      ]);
    }

    this.lastClickedTableRowIndex.set(this.fg.value.items!.length - 1);
    this.setUpNewInventorySettlementRowFg();
  }

  isInventorySettlementItemAlreadyAdded(itemId: number | null | undefined) {
    if (itemId == null) return false;

    return this.fg.controls.items.controls.some((item) => item.controls.itemId.value === itemId);
  }

  getUniqueInventoryProducts(items: IInventoryProductSearchRow[]) {
    return items.filter((item, index, array) => array.findIndex((current) => current.itemId === item.itemId) === index);
  }

  onCurrentInventoryItemChange(item: IInventoryProductSearchRow) {
    this.newInventorySettlementItemRowFg.patchValue({
      itemId: item.itemId,
      unitId: item.unitId,
      systemQuantity: item.quantity,
      actualQuantity: item.quantity,
    });

    this.currentInventoryProducts.update((pre) => [...pre.filter((product) => product.itemId !== item.itemId), item]);
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
  //current opening balance item changes
  //

  lastClickedTableRowIndex = signal<number | null>(null);

  currentEditRowIndex = signal<number>(-1);

  editInventorySettlementRow(rowIndex: number) {
    this.lastClickedTableRowIndex.set(rowIndex + 1);
    this.currentEditRowIndex.set(rowIndex);
  }
  isInventorySettlementRowEditable(rowIndex: number) {
    return this.currentEditRowIndex() === rowIndex;
  }
  deleteInventorySettlementRow(rowIndex: number) {
    this.fg.controls.items.removeAt(rowIndex);
    this.currentEditRowIndex.set(-1);
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
  // item products search
  //

  products = signal<IInventoryProductSearchRow[]>([]);
  currentInventoryProducts = signal<Partial<IInventoryProductSearchRow>[]>([]);
  displayedInventoryProducts = computed(() => {
    const current = this.currentInventoryProducts();
    const products = this.products();

    if (!current.length) return products;

    const currentMap = new Map(current.map((a) => [a.itemId, a]));

    // Replace matching ones, keep the rest
    const merged = products.map((p) => (currentMap.has(p.itemId) ? { ...p, ...currentMap.get(p.itemId)! } : p));

    // Inject ones not present in current page
    const missing = current.filter((c) => !products.some((p) => p.itemId === c.itemId));

    // Usually best UX: current selections first
    return [...missing, ...merged];
  });
  productsPaginationInfo: IPaginationInfo = {
    pageIndex: 0,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };
  previousInventoryProductSearchValue = '';

  searchInventoryProducts(
    pageIndex: number,
    searchValue: string = '',
    searchEnum: InventoryProductSearchEnum = InventoryProductSearchEnum.Name,
  ) {
    this.inventoryService
      .searchProducts({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 20,
        },
        searchFilters: [
          {
            column: searchEnum,
            values: [searchValue],
          },
        ],
        fromDate: null,
        removeDateFilter: true,
      })
      .subscribe({
        next: (res) => {
          if (pageIndex === 1) {
            this.products.set(res.rows);
          } else if (res.rows.length > 0) {
            this.products.update((prev) => prev.concat(res.rows));
          }
          this.productsPaginationInfo = {
            pageIndex,
            totalPagesCount: res.paginationInfo.totalPagesCount,
            totalRowsCount: res.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  debouncedInventoryProductsSearch(
    event: IDebounceEvent,
    searchValue: string,
    searchEnum: InventoryProductSearchEnum,
  ) {
    console.log(event);
    if (event.type === 'scrollToEnd') {
      this.searchInventoryProducts(this.productsPaginationInfo.pageIndex + 1, searchValue, searchEnum);
    } else {
      this.searchInventoryProducts(1, searchValue, searchEnum);
    }
  }

  searchInventorySettlementProducts() {
    const quantityOption = this.inventoryBulkSearchFg.controls.quantityOption.value;

    const searchFilters: { column: InventoryProductSearchEnum; values: string[] }[] = [];

    if (quantityOption !== null) {
      searchFilters.push({
        column: InventoryProductSearchEnum.Quantity,
        values: [quantityOption === QuantityOptions.All ? null : String(quantityOption)] as unknown as string[],
      });
    }

    this.inventoryService
      .searchProducts({
        paginationInfo: {
          pageIndex: 1,
          pageSize: 10,
        },
        searchFilters,
        fromDate: null,
        removeDateFilter: true,
      })
      .subscribe({
        next: (res) => {
          const uniqueRows = this.getUniqueInventoryProducts(res.rows);

          this.currentInventoryProducts.set(uniqueRows);
          this.fg.setControl(
            'items',
            this.fb.array(
              uniqueRows.map((item) =>
                this.createItemFg({
                  itemId: item.itemId,
                  unitId: item.unitId,
                  systemQuantity: item.quantity,
                  actualQuantity: item.quantity,
                }),
              ),
            ),
          );
          this.currentEditRowIndex.set(-1);
          this.lastClickedTableRowIndex.set(null);
        },
      });
  }

  getInventoryProduct(itemId: number | null) {
    if (itemId === null) return null;

    return (
      this.currentInventoryProducts().find((product) => product.itemId === itemId) ??
      this.products().find((product) => product.itemId === itemId) ??
      null
    );
  }

  getInventoryItemName(itemId: number | null) {
    return this.getInventoryProduct(itemId)?.itemName ?? '';
  }

  getInventoryUnitName(itemId: number | null) {
    return this.getInventoryProduct(itemId)?.unitName ?? '';
  }

  getDifferenceQuantity(systemQuantity: number | null, actualQuantity: number | null) {
    return +(actualQuantity ?? 0) - +(systemQuantity ?? 0);
  }

  onInventoryProductPageChange = (event: PaginatorState) => this.searchInventoryProducts(event.page! + 1);
}
