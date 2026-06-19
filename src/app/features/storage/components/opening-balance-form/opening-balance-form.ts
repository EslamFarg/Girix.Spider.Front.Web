import { Component, computed, inject, input, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Button, ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Textarea } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { BaseComponent, FormMode, IPaginationInfo } from '@/components';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IProductSearchRow, IProductUnit, ProductSearchEnum, ProductService } from '@/features/classes';
import { IDebounceEvent, Debounce } from '@/directives/debounce';
import { PaginatorState } from 'primeng/paginator';
import { OpeningBalanceSearchEnum, OpeningBalanceService } from '../../services/opening-balance-service';
import { IOpeningBalanceReadResponse } from '../../types/api/opening-balances/responses';
import { NgSelectComponent } from '@ng-select/ng-select';
import { AllowNumbers } from '@/directives/allow-numbers';
import { onlyNumbersAllowed, onlyNumbersOrDotAllowed } from '@/yn-ng';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { A4PrintService } from '@/core';
import { buildOpeningBalancePrintHtml } from '../../utils/opening-balance-print.util';

interface IAppOpeningBalanceItem {
  itemId: number | null;
  unitId: number | null;
  quantity: number | null;
  purchasePrice: number | null;
  salePrice: number | null;
  total: number | null;
}
interface IAppOpeningBalanceItemControls {
  itemId: FormControl<number | null>;
  unitId: FormControl<number | null>;
  quantity: FormControl<number | null>;
  purchasePrice: FormControl<number | null>;
  salePrice: FormControl<number | null>;
  total: FormControl<number | null>;
}

@Component({
  selector: 'app-opening-balance-form',
  imports: [
    Button,
    InputErrorMessageHandler,
    Textarea,
    InputTextModule,
    DatePickerModule,
    InputGroupAddon,
    ReactiveFormsModule,
    NgSelectComponent,
    Debounce,
    AllowNumbers,
    ButtonDirective,
    LoadingDisabledDirective,
],
  templateUrl: './opening-balance-form.html',
  styleUrl: './opening-balance-form.css',
})
export class OpeningBalanceForm extends BaseComponent {
  currentOpeningBalance = signal<IOpeningBalanceReadResponse | null>(null);
  openingBalanceService = inject(OpeningBalanceService);
  a4PrintService = inject(A4PrintService);
  id = input<number | null>(null);

  formMode = computed(() => {
    if (this.currentOpeningBalance()?.id) return FormMode.Update;
    return FormMode.Create;
  });

  /** Saved record identity — only from API-loaded entity with a persisted id. */
  savedRecordId = computed(() => {
    const id = this.currentOpeningBalance()?.id;
    if (id == null || id <= 0) {
      return null;
    }
    return id;
  });

  /** True while no persisted OpeningBalance entity is loaded. */
  isNewRecord = computed(() => this.savedRecordId() === null);

  initialFormValue = {
    // المرجع
    referenceNumber: this.fb.control<string | null>(null, [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(7),
      onlyNumbersAllowed,
    ]),
    // الرقم الفاتورة
    invoiceNumber: this.fb.control<string | null>({ value: null, disabled: true }, []),
    date: this.fb.control<Date | null>(new Date(), [Validators.required]),
    notes: this.fb.control<string | null>(null, [  Validators.maxLength(1000)]),
    items: this.fb.array<FormGroup<IAppOpeningBalanceItemControls>>([], [Validators.required, Validators.minLength(1)]),
  };
  fg = this.fb.group(this.initialFormValue);

  private _itemsChange = toSignal(this.fg.controls.items.valueChanges, { initialValue: null });

  totalQuantity = computed(() => {
    this._itemsChange();
    return this.fg.controls.items.controls.reduce((sum, ctrl) => sum + (Number(ctrl.value.quantity) || 0), 0);
  });

  totalValue = computed(() => {
    this._itemsChange();
    return this.fg.controls.items.controls.reduce((sum, ctrl) => sum + (Number(ctrl.value.total) || 0), 0);
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
    this.searchProducts(1);
    this.setUpNewJournalDetailRowFg();

    this.fg.controls.date.valueChanges.subscribe((value) => {
      if (!value) {
        this.fg.controls.date.setValue(new Date(), { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    const openingBalanceId = this.id();
    if (openingBalanceId && this.initialFormMode() === FormMode.Update) {
      this.loadOpeningBalanceById(openingBalanceId);
    }
  }

  /** Loads entity from API and patches form — keeps items, enables Update mode. */
  private applyOpeningBalanceFromApi(data: IOpeningBalanceReadResponse) {
    this.currentOpeningBalance.set(data);
    this.fg.patchValue({
      referenceNumber: data.referenceNumber,
      invoiceNumber: data.invoiceNumber,
      date: new Date(data.date),
      notes: data.notes,
    });
    this.currentProducts.set(
      data.items.map((item) => ({
        id: item.itemId,
        name: item.itemName,
      })),
    );
    this.fg.setControl(
      'items',
      this.fb.array(
        data.items.map((item) => {
          this.getProductUnits(item.itemId);
          return this.createItemFg(item);
        }),
      ),
    );
  }

  private loadOpeningBalanceById(id: number) {
    this.openingBalanceService.getById(id).subscribe({
      next: (data) => this.applyOpeningBalanceFromApi(data),
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
  //
  //
  //

  onSubmitOpeningBalance() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      console.log('invalid');
      console.log(this.fg.getRawValue());
      return;
    }

    //collect data to send
    let data = {
      ...this.fg.getRawValue(),
      date: this.UtcToLocalIso(this.fg.value.date!.toISOString()),
    };

    switch (this.formMode()) {
      case FormMode.Create:
        this.openingBalanceService.create(data).subscribe({
          next: (createdId) => {
            this.loadOpeningBalanceById(createdId);
          },
        });
        break;
      case FormMode.Update:
        this.openingBalanceService.patch({ ...data, id: this.savedRecordId()! }).subscribe({
          next: () => {
            this.loadOpeningBalanceById(this.savedRecordId()!);
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

  findOpeningBalanceInvoiceByNumber(invoiceNumber: string) {
    return this.openingBalanceService.getByInvoiceNumber(invoiceNumber);
  }

  debouncedFindOpeningBalanceInvoiceByNumberByNumber(event: any, invoiceNumber: string) {
    console.log(event);
    if (!invoiceNumber) return;

    this.findOpeningBalanceInvoiceByNumber(invoiceNumber).subscribe({
      next: (data) => this.applyOpeningBalanceFromApi(data),
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
  //
  //
  //setting up new opening balance item
  //

  newOpeningBalanceItemRowFg!: FormGroup<IAppOpeningBalanceItemControls>;

  calculateItemTotal(data?: Partial<IAppOpeningBalanceItem>) {
    const quantity = +(data?.quantity ?? 0);
    const purchasePrice = +(data?.purchasePrice ?? 0);
    return { total: +(quantity * purchasePrice).toFixed(2) };
  }

  normalizeAmount(control: AbstractControl) {
    const num = parseFloat(String(control.value ?? 0));
    if (isNaN(num) || num < 0) {
      control.setValue(0, { emitEvent: true });
      return;
    }
    control.setValue(parseFloat(num.toFixed(2)), { emitEvent: true });
  }

  createItemFg(data?: Partial<IAppOpeningBalanceItem>) {
    const initialTotal = data?.total ?? this.calculateItemTotal(data).total;
    const fg = this.fb.group<IAppOpeningBalanceItemControls>({
      itemId: this.fb.control<number | null>(data?.itemId ?? null, [Validators.required]),
      unitId: this.fb.control<number | null>(data?.unitId ?? null, [Validators.required]),
      quantity: this.fb.control<number | null>(data?.quantity ?? null, [
        Validators.required,
        onlyNumbersOrDotAllowed,
      ]),
      purchasePrice: this.fb.control<number | null>(data?.purchasePrice ?? null, [
        Validators.required,
        onlyNumbersOrDotAllowed,
      ]),
      salePrice: this.fb.control<number | null>(data?.salePrice ?? null, [
        Validators.required,
        onlyNumbersOrDotAllowed,
      ]),
      total: this.fb.control<number | null>(initialTotal, [onlyNumbersOrDotAllowed]),
    });

    fg.valueChanges.subscribe({
      next: (values) => {
        const { total } = this.calculateItemTotal(values);
        fg.patchValue({ total }, { emitEvent: false });
        this.fg.updateValueAndValidity({ emitEvent: false });
      },
    });

    return fg;
  }

  setUpNewJournalDetailRowFg() {
    if (this.newOpeningBalanceItemRowFg) {
      this.newOpeningBalanceItemRowFg.reset();
    } else {
      this.newOpeningBalanceItemRowFg = this.createItemFg();
    }
  }

  addNewOpeningBalanceItem() {
    if (this.newOpeningBalanceItemRowFg.invalid) {
      this.newOpeningBalanceItemRowFg.markAllAsTouched();
      //log errors
      Object.entries(this.newOpeningBalanceItemRowFg.controls!).forEach(([key, value]) => {
        if (value.errors) {
          console.log(key, value.errors);
        }
      });
      return;
    }

    const fgValue = { ...this.newOpeningBalanceItemRowFg.getRawValue() };
    const { total } = this.calculateItemTotal(fgValue);

    this.fg.controls.items!.push(this.createItemFg({ ...fgValue, total }));

    const currentProduct = this.products().find((product) => product.id === fgValue.itemId)!;

    this.currentProducts.update((pre) => [...pre.filter((product) => product.id !== fgValue.itemId), currentProduct]);

    this.lastClickedTableRowIndex.set(this.fg.value.items!.length - 1);
    this.setUpNewJournalDetailRowFg();
  }

  onCurrentItemChange(selected: IProductSearchRow | number) {
    this.applyProductToRow(selected, this.newOpeningBalanceItemRowFg);
  }

  onItemChange(selected: IProductSearchRow | number, fg: FormGroup<IAppOpeningBalanceItemControls>) {
    this.applyProductToRow(selected, fg);
  }

  private resolveProduct(selected: IProductSearchRow | number): IProductSearchRow | undefined {
    const id = typeof selected === 'number' ? selected : selected.id;
    return this.products().find((p) => p.id === id);
  }

  /** Same product auto-fill logic as Purchases screen. */
  private applyProductToRow(
    selected: IProductSearchRow | number,
    fg: FormGroup<IAppOpeningBalanceItemControls>,
  ) {
    const item = this.resolveProduct(selected);
    if (!item) {
      return;
    }

    const purchasePrice = item.costPrice > 0 ? item.costPrice / (1 + item.tax / 100) : 0;
    const { total } = this.calculateItemTotal({ quantity: 1, purchasePrice });

    fg.patchValue({
      itemId: item.id,
      unitId: null,
      quantity: 1,
      salePrice: +item.priceWithTax,
      purchasePrice: +purchasePrice.toFixed(2),
      total: +total.toFixed(2),
    });

    this.getProductUnits(item.id, fg);
  }

  lastClickedTableRowIndex = signal<number | null>(null);

  deleteOpeningBalanceRow(rowIndex: number) {
    this.fg.controls.items.removeAt(rowIndex);
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

  products = signal<IProductSearchRow[]>([]);
  currentProducts = signal<Partial<IProductSearchRow>[]>([]);
  productService = inject(ProductService);
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
  productsPaginationInfo: IPaginationInfo = {
    pageIndex: 0,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };
  previousProductSearchValue = '';

  searchProducts(pageIndex: number, searchValue: string = '') {
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
          {
            column: ProductSearchEnum.Id,
            values: [searchValue],
          }
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

  onSubmitProductSearch = () => this.fg.valid && this.searchProducts(1);

  onProductPageChange = (event: PaginatorState) => this.searchProducts(event.page! + 1);
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
  // product units
  //

  units = new Map<number, Signal<IProductUnit[]>>();

  getProductUnits(
    productId: number,
    fg: FormGroup<IAppOpeningBalanceItemControls> = this.newOpeningBalanceItemRowFg,
  ) {
    if (!productId) {
      return signal<IProductUnit[]>([]);
    }

    if (!this.units.has(productId)) {
      const unitsSignal = signal<IProductUnit[]>([]);
      this.units.set(productId, unitsSignal);
      this.productService.getUnitsByProductId(productId).subscribe({
        next: (res) => {
          unitsSignal.set(res);
          fg.patchValue({ unitId: res[0]?.unitId ?? null });
        },
      });
      return unitsSignal;
    }

    const cached = this.units.get(productId)!();
    if (cached.length && !fg.controls.unitId.value) {
      fg.patchValue({ unitId: cached[0]?.unitId ?? null });
    }
    return this.units.get(productId)!;
  }

  onResetForm() {
    if (!this.savedRecordId()) {
      this.currentOpeningBalance.set(null);
      this.fg.reset({ date: new Date() });
      this.fg.controls.items.clear();
      this.setUpNewJournalDetailRowFg();
    } else {
      this.router.navigateByUrl('/storage/opening-balances/add');
    }
  }

  printOpeningBalance() {
    const invoice = this.currentOpeningBalance();
    if (!invoice?.id) {
      return;
    }

    this.a4PrintService.print(buildOpeningBalancePrintHtml(invoice));
  }

  deleteOpeningBalance(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل أنت متأكد من حذف الرصيد الافتتاحي؟',
      header: 'حذف الرصيد الافتتاحي',
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
        this.openingBalanceService.delete(id).subscribe({
          next: () => {
            this.router.navigateByUrl('/storage/opening-balances/add');
          },
        });
      },
      
    });
  }
}
