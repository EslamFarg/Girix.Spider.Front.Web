import { Component, computed, inject, input, signal } from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { BaseComponent, FormMode, IPaginationInfo } from '@/components/base-component/base-component';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaginatorState, Paginator } from 'primeng/paginator';
import { IInventoryProductSearchRow, IInventoryReadResponse } from '../../types/api/inventory/responses';
import { InventoryProductSearchEnum, InventoryService } from '../../services/inventory-service';
import { ControlsOf } from '@/yn-ng/types/helpers';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { AllowNumbers } from '@/directives/allow-numbers';
import { onlyNumbersOrDotAllowed, onlyNumbersOrEnLettersAllowed } from '@/yn-ng';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { TooltipModule } from 'primeng/tooltip';
import { A4PrintService } from '@/core';
import { buildInventorySettlementPrintHtml } from '../../utils/inventory-settlement-print.util';

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
    InputErrorMessageHandler,
    InputTextModule,
    DatePickerModule,
    InputGroupAddon,
    ReactiveFormsModule,
    Button,
    NgSelectComponent,
    Debounce,
    AllowNumbers,
    ButtonDirective,
    LoadingDisabledDirective,
    Paginator,
    TooltipModule,
  ],
  templateUrl: './inventory-settlement-form.html',
  styleUrl: './inventory-settlement-form.css',
})
export class InventorySettlementForm extends BaseComponent {
  currentInventory = signal<IInventoryReadResponse | null>(null);
  inventoryService = inject(InventoryService);
  a4PrintService = inject(A4PrintService);
  id = input<number | null>(null);
  InventoryProductSearchEnum = InventoryProductSearchEnum;
  QuantityOptions = QuantityOptions;

  formMode = computed(() => {
    if (this.currentInventory()?.id) return FormMode.Update;
    return FormMode.Create;
  });

  savedRecordId = computed(() => {
    const recordId = this.currentInventory()?.id;
    if (recordId == null || recordId <= 0) {
      return null;
    }
    return recordId;
  });

  isNewRecord = computed(() => this.savedRecordId() === null);

  initialFormValue = {
    settlementNumber: this.fb.control<string | null>({ value: null, disabled: true }, []),
    referenceNumber: this.fb.control<string | null>(null, [Validators.maxLength(16), onlyNumbersOrEnLettersAllowed]),
    settlementDate: this.fb.control<Date | null>(new Date(), [Validators.required]),
    items: this.fb.array<FormGroup<IAppInventoryItemControls>>([], [Validators.required, Validators.minLength(1)]),
  };
  fg = this.fb.group(this.initialFormValue);
  inventoryBulkSearchFg = this.fb.group<IInventorySettlementBulkSearchControls>({
    quantityOption: this.fb.control<QuantityOptions | null>(QuantityOptions.All),
  });

  constructor() {
    super();
    this.searchInventoryProducts(1);
    this.setUpNewInventorySettlementRowFg();

    this.fg.controls.settlementDate.valueChanges.subscribe((value) => {
      if (!value) {
        this.fg.controls.settlementDate.setValue(new Date(), { emitEvent: false });
      }
    });

    this.inventoryBulkSearchFg.controls.quantityOption.valueChanges.subscribe(() => {
      this.searchInventorySettlementProducts(1);
    });
  }

  ngOnInit() {
    const inventoryId = this.id();
    if (inventoryId && this.initialFormMode() === FormMode.Update) {
      this.loadInventorySettlementById(inventoryId);
    }
  }

  private applyInventorySettlementFromApi(data: IInventoryReadResponse) {
    this.currentInventory.set(data);
    this.fg.patchValue({
      settlementNumber: data.settlementNumber,
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
    this.lastClickedTableRowIndex.set(null);
  }

  private loadInventorySettlementById(id: number) {
    this.inventoryService.getById(id).subscribe({
      next: (data) => this.applyInventorySettlementFromApi(data),
    });
  }

  onSubmitInventory() {
    if (this.fg.controls.items.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'يجب إضافة صنف واحد على الأقل',
      });
      this.fg.controls.items.markAsTouched();
      return;
    }
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
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

    switch (this.formMode()) {
      case FormMode.Create:
        this.inventoryService.create(data).subscribe({
          next: (createdId) => {
            this.loadInventorySettlementById(createdId);
          },
        });
        break;
      case FormMode.Update:
        this.inventoryService.put({ ...data, id: this.savedRecordId()! }).subscribe({
          next: () => {
            this.loadInventorySettlementById(this.savedRecordId()!);
          },
        });
        break;
    }
  }

  debouncedFindInventorySettlementByNumber(event: IDebounceEvent, settlementNumber: string) {
    if (!settlementNumber) return;

    this.inventoryService.getByNumber(settlementNumber).subscribe({
      next: (data) => this.applyInventorySettlementFromApi(data),
    });
  }

  newInventorySettlementItemRowFg!: FormGroup<IAppInventoryItemControls>;

  createItemFg(data?: Partial<IAppInventoryItem>) {
    return this.fb.group<IAppInventoryItemControls>({
      itemId: this.fb.control<number | null>(data?.itemId ?? null, [Validators.required]),
      unitId: this.fb.control<number | null>(data?.unitId ?? null, [Validators.required]),
      systemQuantity: this.fb.control<number | null>(data?.systemQuantity ?? null, [
        Validators.required,
        onlyNumbersOrDotAllowed,
      ]),
      actualQuantity: this.fb.control<number | null>(data?.actualQuantity ?? null, [
        Validators.required,
        onlyNumbersOrDotAllowed,
      ]),
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
      return;
    }

    const fgValue = this.newInventorySettlementItemRowFg.value;

    if (this.isInventorySettlementItemAlreadyAdded(fgValue.itemId)) {
      return this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
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

  /** Auto-fill unit and system quantity; user enters actual quantity only. */
  onCurrentInventoryItemChange(item: IInventoryProductSearchRow) {
    this.newInventorySettlementItemRowFg.patchValue({
      itemId: item.itemId,
      unitId: item.unitId,
      systemQuantity: item.quantity,
      actualQuantity: null,
    });

    this.currentInventoryProducts.update((pre) => [...pre.filter((product) => product.itemId !== item.itemId), item]);
  }

  lastClickedTableRowIndex = signal<number | null>(null);

  deleteInventorySettlementRow(rowIndex: number) {
    this.fg.controls.items.removeAt(rowIndex);
  }

  products = signal<IInventoryProductSearchRow[]>([]);
  currentInventoryProducts = signal<Partial<IInventoryProductSearchRow>[]>([]);
  displayedInventoryProducts = computed(() => {
    const current = this.currentInventoryProducts();
    const products = this.products();

    if (!current.length) return products;

    const currentMap = new Map(current.map((a) => [a.itemId, a]));
    const merged = products.map((p) => (currentMap.has(p.itemId) ? { ...p, ...currentMap.get(p.itemId)! } : p));
    const missing = current.filter((c) => !products.some((p) => p.itemId === c.itemId));

    return [...missing, ...merged];
  });
  productsPaginationInfo: IPaginationInfo = {
    pageIndex: 0,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

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
    if (event.type === 'scrollToEnd') {
      this.searchInventoryProducts(this.productsPaginationInfo.pageIndex + 1, searchValue, searchEnum);
    } else {
      this.searchInventoryProducts(1, searchValue, searchEnum);
    }
  }

  inventorySettlementProductsPaginationInfo: IPaginationInfo = {
    pageIndex: 0,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

  searchInventorySettlementProducts(pageIndex: number = 1) {
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
          pageIndex,
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
                  actualQuantity: null,
                }),
              ),
            ),
          );
          this.inventorySettlementProductsPaginationInfo = {
            pageIndex,
            totalPagesCount: res.paginationInfo.totalPagesCount,
            totalRowsCount: res.paginationInfo.totalRowsCount,
          };
          this.lastClickedTableRowIndex.set(null);
        },
      });
  }

  onBulkPageChange = (event: PaginatorState) => this.searchInventorySettlementProducts(event.page! + 1);

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

  getDifferenceQuantity(systemQuantity: number | null | undefined, actualQuantity: number | null | undefined) {
    if (actualQuantity == null) {
      return '';
    }
    const diff = +(actualQuantity) - +(systemQuantity ?? 0);
    return diff.toFixed(2);
  }

  formatQuantity(value: number | null | undefined) {
    if (value == null) return '';
    return (+value).toFixed(2);
  }

  normalizeAmount(control: AbstractControl) {
    const num = parseFloat(String(control.value ?? 0));
    if (isNaN(num)) {
      control.setValue(null, { emitEvent: true });
      return;
    }
    control.setValue(parseFloat(num.toFixed(2)), { emitEvent: true });
  }

  onResetForm() {
    if (!this.savedRecordId()) {
      this.currentInventory.set(null);
      this.fg.reset({ settlementDate: new Date() });
      this.fg.controls.items.clear();
      this.inventoryBulkSearchFg.controls.quantityOption.setValue(QuantityOptions.All, { emitEvent: false });
      this.setUpNewInventorySettlementRowFg();
    } else {
      this.router.navigateByUrl('/storage/inventory/add');
    }
  }

  printInventorySettlement() {
    const settlement = this.currentInventory();
    if (!settlement?.id) {
      return;
    }
    this.a4PrintService.print(buildInventorySettlementPrintHtml(settlement));
  }

  deleteInventory(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف التسوية',
      header: 'حذف التسوية',
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
        this.inventoryService.delete(id).subscribe({
          next: () => {
            this.router.navigateByUrl('/storage/inventory/add');
          },
        });
      },
    });
  }
}
