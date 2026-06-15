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
import {
    mustIncludeLetters,
    noSymbolsAllowed,
    onlyNumbersAllowed,
    onlyNumbersOrDotAllowed,
    onlyNumbersOrEnLettersAllowed,
} from '@/yn-ng';
import { ControlsOf } from '@/yn-ng/types/helpers';
import { OrderPaymentType } from '@/features/orders';
import { SupplierService } from '../../services/supplier-service';
import { ISupplierReadResponse } from '../../types/api/supplier/responses';
import { AllowNumbers } from '@/directives/allow-numbers';
import { DecimalMask } from '@/directives/decimal-mask';
import { NgSelectComponent } from '@ng-select/ng-select';
import {
    FinancialAccountSearchEnum,
    FinancialAccountService,
} from '@/features/accounts/services/financial-account-service';
import { ITreeFinancialAccountSearchRow } from '@/features/accounts/types';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { TooltipModule } from 'primeng/tooltip';

interface IAppPurchaseItem {
    menuItemsId: number | null;
    unitId: number | null;
    quantity: number | null;
    purchasePrice: number | null;
    salePrice: number | null;
    taxAmount: number | null;
    total: number | null;
    taxPercentage: number | null;
}
type IAppPurchaseItemControls = ControlsOf<IAppPurchaseItem>;

@Component({
    selector: 'app-purchases-form',
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
        DecimalMask,
        NgSelectComponent,
        TranslatePipe,
        RouterLink,
        LoadingDisabledDirective,
        TooltipModule
    ],
    templateUrl: './purchases-form.html',
    styleUrl: './purchases-form.css',
})
export class PurchasesForm extends BaseComponent {
    PaymentType = OrderPaymentType;
    //
    currentPurchase = signal<IPurchaseReadResponse | null>(null);
    purchaseService = inject(PurchaseService);
    id = input<number | null>(null);

    formMode = computed(() => {
        if (this.currentPurchase()) return FormMode.Update;
        return this.initialFormMode();
    });

    initialFormValue = {
        // المرجع
        referenceNumber: this.fb.control<string | null>(null, [
            //   Validators.required,
            Validators.maxLength(16),
            onlyNumbersOrEnLettersAllowed,
        ]),
        // الرقم الفاتورة
        invoiceNumber: this.fb.control<string | null>({ value: null, disabled: true }, []),
        paymentType: this.fb.control<number | null>(OrderPaymentType.Paid, [Validators.required]),
        invoiceDate: this.fb.control<Date | string | null>(new Date(), [Validators.required]),
        notes: this.fb.control<string | null>(null, [Validators.maxLength(1000)]),
        items: this.fb.array<FormGroup<IAppPurchaseItemControls>>([], [Validators.required, Validators.minLength(1)]),
        //
        supplierId: this.fb.control<number | null>(null, [Validators.required]),
        supplierName: this.fb.control<string | null>({ value: null, disabled: true }, [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
            noSymbolsAllowed,
            mustIncludeLetters,
        ]),
        supplierPhoneNumber: this.fb.control<string | null>({ value: null, disabled: true }, [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(16),
            onlyNumbersAllowed,
        ]),
        supplierTaxNumber: this.fb.control<string | null>({ value: null, disabled: true }, [
            Validators.required,
            onlyNumbersAllowed,
            Validators.minLength(6),
            Validators.maxLength(16),
        ]),
        //
        cashAmount: this.fb.control<number | null>(null, [
            Validators.required,
            Validators.min(0),
            onlyNumbersOrDotAllowed,
        ]),
        networkAmount: this.fb.control<number | null>(null, [
            Validators.required,
            Validators.min(0),
            onlyNumbersOrDotAllowed,
        ]),
        cashAccountId: this.fb.control<number | null>(null, [Validators.required]),
        networkAccountId: this.fb.control<number | null>(null, [Validators.required]),
        //
    };
    fg = this.fb.group(this.initialFormValue);

    isPaidListener = this.fg.controls.paymentType.valueChanges.subscribe({
        next: (value) => {
            const controls = [
                this.fg.controls.cashAmount,
                this.fg.controls.networkAmount,
                this.fg.controls.cashAccountId,
                this.fg.controls.networkAccountId,
            ];

            if (value == OrderPaymentType.Paid) {
                controls.forEach((control) => {
                    control.setValue(null);
                    control.enable();
                });
            } else {
                controls.forEach((control) => {
                    control.setValue(null);
                    control.disable();
                });
            }
            
            this.paymentType.set(value!);
        },
    });

    fgItemsListener = this.fg.controls.items.valueChanges.subscribe({
        next: (data) => {
            console.log('changed');
            this.updateNet();
        },
    });

    updateNet = () => {
        const total = this.fg.controls.items.value?.reduce((acc, item) => acc + (item.total ?? 0), 0);
        this.net.set(+(total ?? 0));
    };

    net = signal(0);
    paymentType=signal(OrderPaymentType.Paid)
    finalNet = computed(() => {
        const net = this.net();
        const paymentType = this.paymentType();
        return this.fg.value.paymentType == OrderPaymentType.Paid ? net : 0;
    });

    cashInputSubscription = this.fg.controls.cashAmount.valueChanges.subscribe((value) => {
        const net = this.finalNet();
        let futureValue = value ?? 0;
        if (futureValue > net) {
            futureValue = net;
        } else if (futureValue < 0) {
            futureValue = 0;
        }
        this.fg.patchValue(
            {
                networkAmount: net - futureValue,
                cashAmount: futureValue,
            },
            { emitEvent: false },
        );
    });

    networkInputSubscription = this.fg.controls.networkAmount?.valueChanges.subscribe((value) => {
        const net = this.finalNet();
        let futureValue = value ?? 0;
        if (futureValue > net) {
            futureValue = net;
        } else if (futureValue < 0) {
            futureValue = 0;
        }
        this.fg.patchValue(
            {
                cashAmount: net - futureValue,
                networkAmount: futureValue,
            },
            { emitEvent: false },
        );
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
                this.purchaseService.getById(purchaseId!).subscribe({
                    next: (data) => {
                        this.currentPurchase.set(data);
                        this.fg.patchValue({
                            ...data,
                            invoiceDate: new Date(data.invoiceDate),
                        });
                        this.currentProducts.set(
                            data.items.map((item) => ({
                                id: item.menuItemsId,
                                name: item.menuItemName,
                            })),
                        );
                        this.fg.setControl(
                            'items',
                            this.fb.array(
                                data.items.map((item) => {
                                    this.getProductUnits(item.menuItemsId);
                                    return this.createItemFg({
                                        ...item,
                                        taxAmount: item.taxAmount / item.quantity,
                                    } as any);
                                }),
                            ),
                        );
                        this.updateNet();
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
            return;
        }

        if (!this.currentSupplier() && FormMode.Create === this.formMode()) {
            return this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'يجب اختيار المورد' });
        }

        // if (this.currentSupplier()!.id !== this.fg.value.supplierId) {
        //   return this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'المورد غير متطابق' });
        // }
        const fgValue = this.fg.getRawValue();
        console.log(this.fg.getRawValue());
        //collect data to send
        let data = {
            ...this.fg.getRawValue(),
            cashAmount: +(fgValue.cashAmount || 0).toFixed(2),
            networkAmount: +(fgValue.networkAmount || 0).toFixed(2),
            invoiceDate: this.UtcToLocalIso((fgValue.invoiceDate as Date)!.toISOString()),
            items: fgValue.items?.map((item: any) => ({
                ...item,
                quantity: +item.quantity,
                taxAmount: +(item.taxAmount * item.quantity).toFixed(2),
                salePrice: +item.salePrice.toFixed(2),
                purchasePrice: +item.purchasePrice.toFixed(2),
            })),
        };

        switch (this.formMode()) {
            case FormMode.Create:
                this.purchaseService.create(data).subscribe({
                    next: (data) => {
                        this.router.navigate(['/storage/purchases']);
                    },
                });
                break;
            case FormMode.Update:
                this.purchaseService.put({ ...data, id: this.currentPurchase()?.id }).subscribe();
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

    findPurchaseInvoiceByNumber(invoiceNumber: string) {
        return this.purchaseService.getByInvoiceNumber(invoiceNumber);
    }

    debouncedFindPurchaseInvoiceByNumber(event: any, invoiceNumber: string) {
        console.log(event);
        if (!invoiceNumber) return;

        this.findPurchaseInvoiceByNumber(invoiceNumber).subscribe({
            next: (data) => {
                this.currentPurchase.set(data);
                this.fg.patchValue({
                    ...data,
                    invoiceDate: new Date(data.invoiceDate),
                });
                this.currentProducts.set(
                    data.items.map((item) => ({
                        id: item.menuItemsId,
                        name: item.menuItemName,
                    })),
                );
                this.fg.setControl(
                    'items',
                    this.fb.array(
                        data.items.map((item) => {
                            this.getProductUnits(item.menuItemsId);
                            return this.createItemFg(item as any);
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
    //

    supplierService = inject(SupplierService);

    currentSupplier = signal<ISupplierReadResponse | null>(null);

    findSupplierByNumber(event: any, supplierId: number) {
        if (!supplierId) return;

        this.supplierService.getById(supplierId).subscribe({
            next: (data) => {
                const { supplierName, supplierPhoneNumber, supplierTaxNumber } = this.fg.controls;
                [supplierName, supplierPhoneNumber, supplierTaxNumber].forEach((control) => control.enable());

                this.currentSupplier.set(data);
                this.fg.patchValue({
                    supplierId: data.id,
                    supplierName: data.name,
                    supplierPhoneNumber: data.phoneNumber,
                    supplierTaxNumber: data.taxNumber,
                });
            },
        });
    }

    onSupplierSearchKeyDown(event: KeyboardEvent, formElement: HTMLFormElement) {
        if (event.key === 'Enter') {
            formElement.requestSubmit();
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
    ProductSearchEnum = ProductSearchEnum;
    searchProducts(
        pageIndex: number,
        searchValue: string = '',
        searchEnum: ProductSearchEnum = ProductSearchEnum.Name,
    ) {
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

    getProductUnits(productId: number, fg: FormGroup<IAppPurchaseItemControls> = this.newPurchaseItemRowFg) {
        console.log('getProductUnits', productId);
        if (!this.units.has(productId)) {
            const unitsSignal = signal<IProductUnit[]>([]);
            this.units.set(productId, unitsSignal);
            this.productService.getUnitsByProductId(productId).subscribe({
                next: (res) => {
                    unitsSignal.set(res);
                    fg.patchValue({ unitId: res[0]?.unitId });
                },
            });
            console.log('unitsSignal', unitsSignal);
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

    editPurchaseRow(rowIndex: number) {
        this.lastClickedTableRowIndex.set(rowIndex + 1);
        this.currentEditRowIndex.set(rowIndex);
    }
    isRowEditable(rowIndex: number) {
        return this.currentEditRowIndex() === rowIndex;
    }
    deltePurchaseRow(rowIndex: number) {
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
    newPurchaseItemRowFg!: FormGroup<IAppPurchaseItemControls>;

    createItemFg(data?: IAppPurchaseItem) {
        const fg = this.fb.group<IAppPurchaseItemControls>({
            menuItemsId: this.fb.control<number | null>(data?.menuItemsId ?? null, [Validators.required]),
            unitId: this.fb.control<number | null>(data?.unitId ?? null, [Validators.required]),
            quantity: this.fb.control<number | null>(data?.quantity ?? null, [Validators.required, Validators.min(1)]),
            purchasePrice: this.fb.control<number | null>(data?.purchasePrice ?? null, [
                Validators.required,
                Validators.min(1),
            ]),
            salePrice: this.fb.control<number | null>(data?.salePrice ?? null, [
                Validators.required,
                Validators.min(1),
            ]),
            total: this.fb.control<number | null>(this.calculateItemTotal(data).total ?? null, []),
            taxAmount: this.fb.control<number | null>(data?.taxAmount ?? null, [
                Validators.required,
                Validators.min(0),
            ]),
            taxPercentage: this.fb.control<number | null>(data?.taxPercentage ?? -1, []),
        });
        fg.valueChanges.subscribe({
            next: (values) => {
                const { total, taxAmount } = this.calculateItemTotal(values);
                fg.patchValue({ total, taxAmount }, { emitEvent: false });
                //trigger main fg value changes listener
                this.fg.updateValueAndValidity();
                this.updateNet();
            },
        });
        return fg;
    }

    calculateItemTotal(data?: Partial<IAppPurchaseItem>) {
        const taxPercentage = data?.taxPercentage === -1 ? 0 : (data?.taxPercentage ?? 0);
        const applyTaxAmountDirectly = taxPercentage === 0;
        const purchasePrice = data?.purchasePrice ?? 0;
        const priceWithTax = applyTaxAmountDirectly
            ? purchasePrice + (data?.taxAmount ?? 0)
            : purchasePrice * (1 + taxPercentage / 100);
        const quantity = data?.quantity ?? 0;
        const taxAmount = priceWithTax - purchasePrice;
        const total = priceWithTax * quantity;
        return { total, taxAmount };
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

        const _fgValue = this.newPurchaseItemRowFg.value;
        const fgValue = { ..._fgValue };

        this.fg.controls.items!.push(this.createItemFg(fgValue as IAppPurchaseItem));

        const currentProduct = this.products().find((product) => product.id === fgValue.menuItemsId)!;

        this.currentProducts.update((pre) => [
            ...pre.filter((product) => product.id !== fgValue.menuItemsId),
            currentProduct,
        ]);

        this.lastClickedTableRowIndex.set(this.fg.value.items!.length - 1);
        this.setUpNewPurchaseDetailRowFg();
    }

    log(any: any = null) {
        console.log('log', any);

        console.log(this.fg.value);
    }

    onItemChange(item: IProductSearchRow, fg: FormGroup<IAppPurchaseItemControls>) {
        const purchasePrice = item.costPrice / (1 + item.tax / 100);
        const { total, taxAmount } = this.calculateItemTotal({
            quantity: 1,
            salePrice: +item.priceWithTax,
            purchasePrice: +purchasePrice,
            taxAmount: +(item.costPrice - purchasePrice),
            taxPercentage: item.tax,
        });
        fg.patchValue({
            unitId: null,
            menuItemsId: item.id,
            quantity: 1,
            salePrice: +item.priceWithTax,
            purchasePrice: +purchasePrice,
            taxAmount,
            taxPercentage: item.tax,
            total,
        });
        this.getProductUnits(item.id, fg);
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

    cashAccountSearchFg = this.fb.group({
        searchTerm: this.fb.control('', [Validators.maxLength(100), noSymbolsAllowed, Validators.minLength(1)]),
    });
    networkAccountSearchFg = this.fb.group({
        searchTerm: this.fb.control('', [Validators.maxLength(100), noSymbolsAllowed, Validators.minLength(1)]),
    });

    financialAccountService = inject(FinancialAccountService);

    cashAccounts = signal<ITreeFinancialAccountSearchRow[]>([]);
    networkAccounts = signal<ITreeFinancialAccountSearchRow[]>([]);

    displayedCashAccounts = computed(() => [...this.cashAccounts()]);
    displayedNetworkAccounts = computed(() => [...this.networkAccounts()]);

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
        // .subscribe({
        //   next: (res) => {
        //     if (res.value.rows.length > 0) {
        //       this.previousAccountsSearchTerm = data.searchTerm ?? '';
        //       if (data.pageIndex == 1) {
        //         this.customers.set(res.value.rows);
        //       } else {
        //         this.customers.update((prev) => prev.concat(res.value.rows));
        //       }
        //       this.customersSearchPaginationInfo = {
        //         pageIndex: data.pageIndex,
        //         totalPagesCount: res.value.paginationInfo.totalPagesCount,
        //         totalRowsCount: res.value.paginationInfo.totalRowsCount,
        //       };
        //     }
        //   },
        // });
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
            this.searchAccounts({
                pageIndex: this.cashAccountsSearchPaginationInfo.pageIndex + 1,
                searchTerm,
            }).subscribe({
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
       onResetForm() {
    if(this.formMode() === FormMode.Create){
      this.fg.reset();
    }else{
      this.router.navigateByUrl('/storage/purchases/add');
    }
  }
}
