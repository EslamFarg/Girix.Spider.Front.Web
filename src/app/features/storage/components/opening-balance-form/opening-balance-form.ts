import { Component, computed, inject, input, Signal, signal } from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Textarea } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { BaseComponent, FormMode, IPaginationInfo } from '@/components';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IProductSearchRow, IProductUnit, ProductSearchEnum, ProductService } from '@/features/classes';
import { IDebounceEvent, Debounce } from '@/directives/debounce';
import { PaginatorState } from 'primeng/paginator';
import { OpeningBalanceSearchEnum, OpeningBalanceService } from '../../services/opening-balance-service';
import { IOpeningBalanceReadResponse } from '../../types/api/opening-balances/responses';
import { ConsoleService, NgSelectComponent } from '@ng-select/ng-select';
import { AllowNumbers } from '@/directives/allow-numbers';
import { IUnitSearchRow, UnitSearchEnum, UnitService } from '@/features/classes/services/unit-service';
import { FormControlNotifier } from '@/directives/form-control-notifier';

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
    FormControlNotifier,
    ButtonDirective,
  ],
  templateUrl: './opening-balance-form.html',
  styleUrl: './opening-balance-form.css',
})
export class OpeningBalanceForm extends BaseComponent {
  currentOpeningBalance = signal<IOpeningBalanceReadResponse | null>(null);
  openingBalanceService = inject(OpeningBalanceService);
  id = input<number | null>(null);

  formMode = input<FormMode>(FormMode.Create);

  initialFormValue = {
    // المرجع
    referenceNumber: this.fb.control<string | null>(null, [Validators.required]),
    // الرقم الفاتورة
    invoiceNumber: this.fb.control<string | null>({ value: null, disabled: true }, []),
    date: this.fb.control<Date | null>(null, [Validators.required]),
    notes: this.fb.control<string | null>(null, [Validators.required, Validators.maxLength(1000)]),
    items: this.fb.array<FormGroup<IAppOpeningBalanceItemControls>>([], [Validators.required, Validators.minLength(1)]),
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
    this.searchProducts(1);
    this.setUpNewJournalDetailRowFg();
  }

  ngOnInit() {
    const openingBalanceId = this.id();
    switch (this.formMode()) {
      case FormMode.Create:
        break;
      case FormMode.Update:
        this.openingBalanceService.getById(openingBalanceId!).subscribe({
          next: (data) => {
            this.currentOpeningBalance.set(data);
            this.fg.patchValue({
              referenceNumber: data.referenceNumber,
              invoiceNumber: data.invoiceNumber,
              date: new Date(data.date),
              notes: data.notes,
            });
            this.fg.setControl(
              'items',
              this.fb.array(
                data.items.map((item) => {
                  this.getProductUnits(item.itemId);
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
          next: (data) => {
            this.router.navigate(['/storage/opening-balances']);
          },
        });
        break;
      case FormMode.Update:
        this.openingBalanceService.patch({ ...data, id: this.currentOpeningBalance()?.id }).subscribe();
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
      next: (data) => {
        this.currentOpeningBalance.set(data);
        this.fg.patchValue({
          referenceNumber: data.referenceNumber,
          invoiceNumber: data.invoiceNumber,
          date: new Date(data.date),
          notes: data.notes,
        });
        this.fg.setControl(
          'items',
          this.fb.array(
            data.items.map((item) => {
              this.getProductUnits(item.itemId);
              return this.createItemFg(item);
            }),
          ),
        );
      },
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
  // products
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
  // units
  //

  units = new Map<number, Signal<IProductUnit[]>>();
  unitService = inject(UnitService);

  unitsPaginationInfo: IPaginationInfo = {
    pageIndex: 0,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };
  previousUnitSearchValue = '';

  getProductUnits(productId: number) {
    if (!this.units.has(productId)) {
      const unitsSignal = signal<IProductUnit[]>([]);
      this.units.set(productId, unitsSignal);
      this.productService.getUnitsByProductId(productId).subscribe({
        next: (res) => {
          unitsSignal.set(res);
        },
      });
      return unitsSignal;
    } else {
      return this.units.get(productId)!;
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

  lastClickedTableRowIndex = signal<number | null>(null);

  currentEditRowIndex = signal<number>(-1);

  editOpeningBalanceRow(rowIndex: number) {
    this.lastClickedTableRowIndex.set(rowIndex + 1);
    this.currentEditRowIndex.set(rowIndex);
  }
  isRowEditable(rowIndex: number) {
    return this.currentEditRowIndex() === rowIndex;
  }
  delteOpeningBalanceRow(rowIndex: number) {
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
  //
  //
  //
  //
  newOpeningBalanceItemRowFg!: FormGroup<IAppOpeningBalanceItemControls>;

  createItemFg(data?: IAppOpeningBalanceItem) {
    return this.fb.group<IAppOpeningBalanceItemControls>({
      itemId: this.fb.control<number | null>(data?.itemId ?? null, [Validators.required]),
      unitId: this.fb.control<number | null>(data?.unitId ?? null, [Validators.required]),
      quantity: this.fb.control<number | null>(data?.quantity ?? null, [Validators.required]),
      purchasePrice: this.fb.control<number | null>(data?.purchasePrice ?? null, [Validators.required]),
      salePrice: this.fb.control<number | null>(data?.salePrice ?? null, [Validators.required]),
      total: this.fb.control<number | null>(data?.total ?? null, []),
    });
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

    const fgValue = this.newOpeningBalanceItemRowFg.value;

    this.fg.controls.items!.push(this.createItemFg(fgValue as IAppOpeningBalanceItem));

    const currentProduct = this.products().find((product) => product.id === fgValue.itemId)!;

    this.currentProducts.update((pre) => [...pre.filter((product) => product.id !== fgValue.itemId), currentProduct]);

    this.lastClickedTableRowIndex.set(this.fg.value.items!.length - 1);
    this.setUpNewJournalDetailRowFg();
  }

  log(any: any = null) {
    console.log('log', any);

    console.log(this.fg.value);
  }

  onCurrentItemChange(itemId: IProductSearchRow) {
    this.newOpeningBalanceItemRowFg.controls.itemId.setValue(itemId.id);
    this.getProductUnits(itemId.id);
  }
}
