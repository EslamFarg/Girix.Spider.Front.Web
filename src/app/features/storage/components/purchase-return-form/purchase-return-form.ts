import { Component, computed, effect, inject, input, Signal, signal } from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { DatePicker } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { BaseComponent, FormMode, IPaginationInfo } from '@/components';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { PurchaseService } from '../../services/purchase-service';
import { IPurchaseReadResponse } from '../../types/api/purchases/responses';
import { IProductSearchRow, IProductUnit, ProductSearchEnum, ProductService } from '@/features/classes';
import { IDebounceEvent, Debounce } from '@/directives/debounce';
import { PaginatorState } from 'primeng/paginator';
import { UnitService } from '@/features/classes/services/unit-service';
import { mustIncludeLetters, noSymbolsAllowed, onlyNumbersAllowed, onlyNumbersOrEnLettersAllowed } from '@/yn-ng';
import { ControlsOf } from '@/yn-ng/types/helpers';
import { OrderPaymentType } from '@/features/orders';
import { SupplierService } from '../../services/supplier-service';
import { ISupplierReadResponse } from '../../types/api/supplier/responses';
import { AllowNumbers } from '@/directives/allow-numbers';
import { ImgOnly } from '@/directives/img-only';
import { NgSelectComponent } from '@ng-select/ng-select';
import {
  FinancialAccountSearchEnum,
  FinancialAccountService,
} from '@/features/accounts/services/financial-account-service';
import { ITreeFinancialAccountSearchRow } from '@/features/accounts/types';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { PurchaseReturnService } from '../../services/purchase-return-service';
import { IPurchaseReturnReadResponse } from '../../types/api/purchase-return/responses';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";

interface IAppPurchaseReturnItem {
  menuItemsId: number | null;
  unitId: number | null;
  quantity: number | null;
  purchaseInvoiceItemId: number | null;
}
type IAppPurchaseReturnItemControls = ControlsOf<IAppPurchaseReturnItem>;

enum FilterOption {
  Purchase = 1,
  PurchaseReturn = 2,
}
@Component({
  selector: 'app-purchase-return-form',
  imports: [
    Button,
    InputErrorMessageHandler,
    InputGroupAddon,
    DatePicker,
    InputTextModule,
    Select,
    TextareaModule,
    ButtonDirective,
    ReactiveFormsModule,
    Debounce,
    AllowNumbers,
    ImgOnly,
    NgSelectComponent,
    TranslatePipe,
    RouterLink,
    Menu,
    LoadingDisabledDirective
],
  templateUrl: './purchase-return-form.html',
  styleUrl: './purchase-return-form.css',
})
export class PurchaseReturnForm extends BaseComponent {
  PaymentType = OrderPaymentType;
  //
  currentPurchaseReturn = signal<IPurchaseReturnReadResponse | null>(null);
  currentPurchase = signal<IPurchaseReadResponse | null>(null);
  currentItems = computed(() => {
    if (this.currentPurchaseReturn()) {
      return this.currentPurchaseReturn()!.items;
    } else if (this.currentPurchase()) {
      return this.currentPurchase()!.items;
    } else {
      return [];
    }
  });
  //
  purchaseReturnService = inject(PurchaseReturnService);
  purchaseService = inject(PurchaseService);
  id = input<number | null>(null);

  formMode = computed(() => {
    if (this.currentPurchaseReturn()) return FormMode.Update;
    return this.initialFormMode();
  });

  initialFormValue = {
    // المرجع
    referenceNumber: this.fb.control<string | null>({ disabled: true, value: null }, [
      
    ]),
    // رقم الفاتورة
    invoiceNumber: this.fb.control<string | null>({ value: null, disabled: true }, []),
    //returnNumber
    returnNumber: this.fb.control<string | null>({ disabled: true, value: null }, []),
    //
    purchaseInvoiceId: this.fb.control<number | null>(null, []),
    paymentType: this.fb.control<number | null>({ disabled: true, value: null }, []),
    returnDate: this.fb.control<Date | string | null>(new Date(), [Validators.required]),
    notes: this.fb.control<string | null>(null, []),
    items: this.fb.array<FormGroup<IAppPurchaseReturnItemControls>>([], [Validators.required, Validators.minLength(1)]),
    //
    cashAmount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    networkAmount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    cashAccountId: this.fb.control<number | null>(null, [Validators.required]),
    networkAccountId: this.fb.control<number | null>(null, [Validators.required]),
    //
    supplierId: this.fb.control<number | null>({ disabled: true, value: null }, []),
    supplierName: this.fb.control<string | null>({ disabled: true, value: null }, []),
    supplierPhoneNumber: this.fb.control<string | null>({ disabled: true, value: null }, []),
    supplierTaxNumber: this.fb.control<string | null>({ disabled: true, value: null }, []),
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
    this.setUpNewPurchaseDetailRowFg();
    this.searchAccounts({
      pageIndex: 1,
      searchTerm: '',
    }).subscribe({
      next: (res) => {
        this.cashAccounts.set(res.value.rows);
        this.networkAccounts.set(res.value.rows);
      },
    });
  }

  ngOnInit() {
    const purchaseId = this.id();
    switch (this.formMode()) {
      case FormMode.Create:
        break;
      case FormMode.Update:
        this.purchaseReturnService.getById(purchaseId!).subscribe({
          next: (data) => {
            this.currentPurchaseReturn.set(data);
            this.fg.patchValue({
              ...data,
              returnDate: new Date(data.returnDate),
            });
            this.fg.setControl(
              'items',
              this.fb.array(
                data.items.map((item) => {
                  return this.createItemFg(item as any);
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

  onSubmitPurchase() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      console.log('invalid');
      console.log(this.fg.getRawValue());
      return;
    }

    //collect data to send
    let data = {
      ...this.fg.getRawValue(),
      cashAmount: +(this.fg.value.cashAmount || 0),
      networkAmount: +(this.fg.value.networkAmount || 0),
      returnDate: this.UtcToLocalIso((this.fg.value.returnDate as Date)!.toISOString()),
    };

    switch (this.formMode()) {
      case FormMode.Create:
        this.purchaseReturnService.create(data).subscribe({
          next: (data) => {
            this.router.navigate(['/storage/purchases']);
          },
        });
        break;
      case FormMode.Update:
        this.purchaseReturnService.patch({ ...data, id: this.currentPurchaseReturn()?.id }).subscribe();
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
  //lookup by invoice number for update
  //

  currentFilterOption = FilterOption.Purchase;

  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'فاتورة مشتريات',
      command: () => {
        this.currentFilterOption = FilterOption.Purchase;
      },
    },
    {
      label: 'مرتجع مشتريات',
      command: () => {
        this.currentFilterOption = FilterOption.PurchaseReturn;
      },
    },
  ]);

  debouncedFindPurchaseInvoiceByNumber(event: any, invoiceNumber: string) {
    console.log(event);
    if (!invoiceNumber) return;

    switch (this.currentFilterOption) {
      case FilterOption.Purchase:
        this.purchaseService.getByInvoiceNumber(invoiceNumber).subscribe({
          next: (data) => {
            this.currentPurchaseReturn.set(null);
            this.currentPurchase.set(data);
            this.fg.patchValue({
              ...data,
              returnDate: new Date(),
              purchaseInvoiceId: data.id,
            });
            this.fg.setControl(
              'items',
              this.fb.array(
                data.items.map((item) => {
                  return this.createItemFg({
                    menuItemsId: item.menuItemsId,
                    quantity: item.quantity,
                    purchaseInvoiceItemId: item.id,
                    unitId: item.unitId,
                  });
                }),
              ),
            );
          },
        });
        break;
      case FilterOption.PurchaseReturn:
        this.purchaseReturnService.getByInvoiceNumber(invoiceNumber).subscribe({
          next: (data) => {
            this.currentPurchase.set(null);
            this.currentPurchaseReturn.set(data);
            console.log(data);
            this.fg.patchValue({
              ...data,
              purchaseInvoiceId: data.purchaseInvoiceId,
              invoiceNumber: data.purchaseInvoiceNumber,
              returnNumber: data.returnNumber,
              returnDate: new Date(data.returnDate),
            });
            this.fg.setControl(
              'items',
              this.fb.array(
                data.items.map((item) => {
                  return this.createItemFg({
                    menuItemsId: item.menuItemsId,
                    quantity: item.quantity,
                    purchaseInvoiceItemId: item.id,
                    unitId: item.unitId,
                  });
                }),
              ),
            );
          },
        });
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
  newPurchaseItemRowFg!: FormGroup<IAppPurchaseReturnItemControls>;

  createItemFg(data?: IAppPurchaseReturnItem) {
    return this.fb.group<IAppPurchaseReturnItemControls>({
      menuItemsId: this.fb.control<number | null>(data?.menuItemsId ?? null, [Validators.required]),
      unitId: this.fb.control<number | null>(data?.unitId ?? null, [Validators.required]),
      quantity: this.fb.control<number | null>(data?.quantity ?? null, [
        Validators.required,
        Validators.min(0),
        Validators.max(data?.quantity ?? 0),
      ]),
      purchaseInvoiceItemId: this.fb.control<number | null>(data?.purchaseInvoiceItemId ?? null, [Validators.required]),
    });
  }

  setUpNewPurchaseDetailRowFg() {
    if (this.newPurchaseItemRowFg) {
      this.newPurchaseItemRowFg.reset();
    } else {
      this.newPurchaseItemRowFg = this.createItemFg();
    }
  }

  addNewPurchaseItem() {
    if (this.newPurchaseItemRowFg.invalid) {
      this.newPurchaseItemRowFg.markAllAsTouched();
      //log errors
      Object.entries(this.newPurchaseItemRowFg.controls!).forEach(([key, value]) => {
        if (value.errors) {
          console.log(key, value.errors);
        }
      });
      return;
    }

    const fgValue = this.newPurchaseItemRowFg.value;

    this.fg.controls.items!.push(this.createItemFg(fgValue as IAppPurchaseReturnItem));

    this.setUpNewPurchaseDetailRowFg();
  }

  log(any: any = null) {
    console.log('log', any);

    console.log(this.fg.value);
  }

  onCurrentItemChange(itemId: IProductSearchRow) {
    this.newPurchaseItemRowFg.controls.menuItemsId.setValue(itemId.id);
    this.newPurchaseItemRowFg.controls.unitId.setValue(null);
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
  //Accounts / paid state
  //

  currentCashAccount = signal<{
    id: number;
    name: string;
  } | null>(null);
  currentNetworkAccount = signal<{
    id: number;
    name: string;
  } | null>(null);

  currentAccountsEffect = effect(() => {
    if (this.currentPurchaseReturn()) {
      this.currentCashAccount.set({
        id: this.currentPurchaseReturn()!.cashAccountId,
        name: this.currentPurchaseReturn()!.cashAccountName,
      });
      this.currentNetworkAccount.set({
        id: this.currentPurchaseReturn()!.networkAccountId,
        name: this.currentPurchaseReturn()!.networkAccountName,
      });
    } else if (this.currentPurchase()) {
      this.currentCashAccount.set({
        id: this.currentPurchase()!.cashAccountId,
        name: this.currentPurchase()!.cashAccountName,
      });
      this.currentNetworkAccount.set({
        id: this.currentPurchase()!.networkAccountId,
        name: this.currentPurchase()!.networkAccountName,
      });
    }
  });

  cashAccountSearchFg = this.fb.group({
    searchTerm: this.fb.control('', [Validators.maxLength(100), noSymbolsAllowed, Validators.minLength(1)]),
  });
  networkAccountSearchFg = this.fb.group({
    searchTerm: this.fb.control('', [Validators.maxLength(100), noSymbolsAllowed, Validators.minLength(1)]),
  });

  financialAccountService = inject(FinancialAccountService);

  cashAccounts = signal<ITreeFinancialAccountSearchRow[]>([]);
  networkAccounts = signal<ITreeFinancialAccountSearchRow[]>([]);

  displayedCashAccounts = computed(() => {
    return [
      this.currentCashAccount(),
      ...this.cashAccounts().filter((item) => item.id !== this.currentCashAccount()?.id),
    ];
  });
  displayedNetworkAccounts = computed(() => {
    return [
      this.currentNetworkAccount(),
      ...this.networkAccounts().filter((item) => item.id !== this.currentNetworkAccount()?.id),
    ];
  });

  searchAccounts(data: { pageIndex: number; searchTerm?: string }) {
    return this.financialAccountService.search({
      paginationInfo: {
        pageIndex: data.pageIndex,
        pageSize: 10,
      },
      searchFilters: [
        {
          column: FinancialAccountSearchEnum.Name,
          values: [data.searchTerm ?? ''],
        },
      ],
      fromDate: null,
    });
  }

  cashAccountsSearchPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalRowsCount: 0,
    totalPagesCount: 0,
  };
  networkAccountsSearchPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalRowsCount: 0,
    totalPagesCount: 0,
  };

  previousCashAccountsSearchTerm: string = '';
  previousNetworkAccountsSearchTerm: string = '';

  onCashFinancialAccountsSearch(
    event: IDebounceEvent<{
      term: string;
    }>,
  ) {
    let searchTerm = event?.value?.term ?? '';
    let isNewSearchTerm = searchTerm != this.previousCashAccountsSearchTerm;
    if (event.type === 'scrollToEnd') {
      searchTerm = this.previousCashAccountsSearchTerm;
    }
    if (searchTerm && searchTerm.length > 100) return;
    //
    //
    if (isNewSearchTerm) {
      //refetch page 1
      this.searchAccounts({ pageIndex: 1, searchTerm }).subscribe({
        next: (res) => {
          if (res.value.rows.length > 0) {
            this.previousCashAccountsSearchTerm = searchTerm;
            this.cashAccounts.set(res.value.rows);
            this.cashAccountsSearchPaginationInfo = {
              pageIndex: 1,
              totalPagesCount: res.value.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.paginationInfo.totalRowsCount,
            };
          }
        },
      });
    } else {
      //refetch next page
      this.searchAccounts({ pageIndex: this.cashAccountsSearchPaginationInfo.pageIndex + 1, searchTerm }).subscribe({
        next: (res) => {
          if (res.value.rows.length > 0) {
            this.previousCashAccountsSearchTerm = searchTerm;
            this.cashAccounts.update((prev) => prev.concat(res.value.rows));
            this.cashAccountsSearchPaginationInfo = {
              pageIndex: this.cashAccountsSearchPaginationInfo.pageIndex + 1,
              totalPagesCount: res.value.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.paginationInfo.totalRowsCount,
            };
          }
        },
      });
    }
  }

  onNetworkFinancialAccountsSearch(
    event: IDebounceEvent<{
      term: string;
    }>,
  ) {
    let searchTerm = event?.value?.term ?? '';
    let isNewSearchTerm = searchTerm != this.previousNetworkAccountsSearchTerm;
    if (event.type === 'scrollToEnd') {
      searchTerm = this.previousNetworkAccountsSearchTerm;
    }
    if (searchTerm && searchTerm.length > 100) return;
    //
    //
    if (isNewSearchTerm) {
      //refetch page 1
      this.searchAccounts({ pageIndex: 1, searchTerm }).subscribe({
        next: (res) => {
          if (res.value.rows.length > 0) {
            this.previousNetworkAccountsSearchTerm = searchTerm;
            this.networkAccounts.set(res.value.rows);
            this.networkAccountsSearchPaginationInfo = {
              pageIndex: 1,
              totalPagesCount: res.value.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.paginationInfo.totalRowsCount,
            };
          }
        },
      });
    } else {
      //refetch next page
      this.searchAccounts({
        pageIndex: this.networkAccountsSearchPaginationInfo.pageIndex + 1,
        searchTerm,
      }).subscribe({
        next: (res) => {
          if (res.value.rows.length > 0) {
            this.previousNetworkAccountsSearchTerm = searchTerm;
            this.networkAccounts.update((prev) => prev.concat(res.value.rows));
            this.networkAccountsSearchPaginationInfo = {
              pageIndex: this.networkAccountsSearchPaginationInfo.pageIndex + 1,
              totalPagesCount: res.value.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.paginationInfo.totalRowsCount,
            };
          }
        },
      });
    }
  }
}
