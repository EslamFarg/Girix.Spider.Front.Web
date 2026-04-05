import { Component, computed, inject, input, signal } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { DatePicker } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { BaseComponent, FormMode, IPaginationInfo } from '@/components/base-component/base-component';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Button } from 'primeng/button';
import { IInventoryProductSearchRow, IInventoryReadResponse } from '../../types/api/inventory/responses';
import { InventoryProductSearchEnum, InventoryService } from '../../services/inventory-service';
import { ControlsOf } from '@/yn-ng/types/helpers';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { tap } from 'rxjs';
import { AllowNumbers } from "@/directives/allow-numbers";

interface IAppInventoryItem {
  itemId: number | null;
  unitId: number | null;
  systemQuantity: number | null;
  actualQuantity: number | null;
}
type IAppInventoryItemControls = ControlsOf<IAppInventoryItem>;

@Component({
  selector: 'app-inventory-settlement-form',
  imports: [
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    DatePicker,
    InputTextModule,
    ReactiveFormsModule,
    Paginator,
    Button,
    ReactiveFormsModule,
    NgSelectComponent,
    Debounce,
    AllowNumbers
],
  templateUrl: './inventory-settlement-form.html',
  styleUrl: './inventory-settlement-form.css',
})
export class InventorySettlementForm extends BaseComponent {
  currentInventory = signal<IInventoryReadResponse | null>(null);
  inventoryService = inject(InventoryService);
  id = input<number | null>(null);

  formMode = input<FormMode>(FormMode.Create);

  initialFormValue = {
    // المرجع
    referenceNumber: this.fb.control<string | null>(null, [Validators.required]),
    // الرقم الفاتورة
    settlementDate: this.fb.control<Date | null>({ value: null, disabled: true }, []),
    items: this.fb.array<FormGroup<IAppInventoryItemControls>>([], [Validators.required, Validators.minLength(1)]),
  };
  fg = this.fb.group(this.initialFormValue);

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
    switch (this.formMode()) {
      case FormMode.Create:
        break;
      case FormMode.Update:
        this.inventoryService.getById(inventoryId!).subscribe({
          next: (data) => {
            this.currentInventory.set(data);
            this.fg.patchValue({
              referenceNumber: data.referenceNumber,
              settlementDate: new Date(data.settlementDate),
            });
            this.fg.setControl(
              'items',
              this.fb.array(
                data.items.map((item) => {
                  return this.createItemFg(item);
                }),
              ),
            );
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

    //collect data to send
    let data = {
      ...this.fg.getRawValue(),
      settlementDate: this.UtcToLocalIso(this.fg.value.settlementDate!.toISOString()),
    };

    switch (this.formMode()) {
      case FormMode.Create:
        this.inventoryService.create(data).subscribe({
          next: (data) => {
            this.router.navigate(['/storage/inventory']);
          },
        });
        break;
      case FormMode.Update:
        this.inventoryService.patch({ ...data, id: this.currentInventory()?.id }).subscribe();
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
          this.currentInventory.set(data);
          this.fg.patchValue({
            referenceNumber: data.referenceNumber,
            settlementDate: new Date(data.settlementDate),
          });
          this.fg.setControl(
            'items',
            this.fb.array(
              data.items.map((item) => {
                return this.createItemFg(item);
              }),
            ),
          );
        },
      }),
    );
  }

  debouncedFindInventorySettlementByNumberByNumber(event: any, invoiceNumber: string) {
    console.log(event);
    if (!invoiceNumber) return;

    this.inventoryService.getByNumber(invoiceNumber).subscribe();
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
      systemQuantity: this.fb.control<number | null>(data?.systemQuantity ?? null, [Validators.required]),
      actualQuantity: this.fb.control<number | null>(data?.actualQuantity ?? null, [Validators.required]),
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

    this.fg.controls.items!.push(this.createItemFg(fgValue as IAppInventoryItem));

    const currentInventoryProduct = this.products().find((product) => product.id === fgValue.itemId)!;

    this.currentInventoryProducts.update((pre) => [...pre.filter((product) => product.id !== fgValue.itemId), currentInventoryProduct]);

    this.lastClickedTableRowIndex.set(this.fg.value.items!.length - 1);
    this.setUpNewInventorySettlementRowFg();
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

    const currentMap = new Map(current.map((a) => [a.id, a]));

    // Replace matching ones, keep the rest
    const merged = products.map((p) => (currentMap.has(p.id) ? { ...p, ...currentMap.get(p.id)! } : p));

    // Inject ones not present in current page
    const missing = current.filter((c) => !products.some((p) => p.id === c.id));

    // Usually best UX: current selections first
    return [...missing, ...merged];
  });
  productsPaginationInfo: IPaginationInfo = {
    pageIndex: 0,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };
  previousInventoryProductSearchValue = '';

  searchInventoryProducts(pageIndex: number, searchValue: string = '') {
    this.inventoryService
      .searchProducts({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 20,
        },
        searchFilters: [
          {
            column: InventoryProductSearchEnum.Name,
            values: [searchValue],
          },
        ],
        fromDate: null,
        removeDateFilter: true,
      })
      .subscribe({
        next: (res) => {
          if (res.rows.length > 0) {
            if (pageIndex === 1) {
              this.products.set(res.rows);
            } else {
              this.products.update((prev) => prev.concat(res.rows));
            }
            this.productsPaginationInfo = {
              pageIndex,
              totalPagesCount: res.paginationInfo.totalPagesCount,
              totalRowsCount: res.paginationInfo.totalRowsCount,
            };
          }
        },
      });
  }

  debouncedInventoryProductsSearch(event: IDebounceEvent, searchValue: string) {
    console.log(event);
    if (event.type === 'scrollToEnd') {
      this.searchInventoryProducts(this.productsPaginationInfo.pageIndex + 1);
    } else {
      this.searchInventoryProducts(1, searchValue);
    }
  }

  onSubmitInventoryProductSearch = () => this.fg.valid && this.searchInventoryProducts(1);

  onInventoryProductPageChange = (event: PaginatorState) => this.searchInventoryProducts(event.page! + 1);
}
