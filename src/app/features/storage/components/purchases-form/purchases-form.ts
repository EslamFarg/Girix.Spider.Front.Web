import { AbstractControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, computed, inject, input, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Button, ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { DatePicker } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { BaseComponent, FormMode, IPaginationInfo } from '@/components';
import { PurchaseService } from '../../services/purchase-service';
import { IPurchaseReadResponse } from '../../types/api/purchases/responses';
import { IProductSearchRow, IProductUnit, ProductSearchEnum, ProductService } from '@/features/classes';
import { IDebounceEvent, Debounce } from '@/directives/debounce';
import { UnitService } from '@/features/classes/services/unit-service';
import { noSymbolsAllowed, onlyNumbersOrDotAllowed, onlyNumbersOrEnLettersAllowed } from '@/yn-ng';
import { ControlsOf } from '@/yn-ng/types/helpers';
import { OrderPaymentType } from '@/features/orders';
import { SupplierService, SupplierSearchEnum } from '../../services/supplier-service';
import { ISupplierSearchRow } from '../../types/api/supplier/responses';
import { AllowNumbers } from '@/directives/allow-numbers';
import { NgSelectComponent } from '@ng-select/ng-select';
import {
    FinancialAccountSearchEnum,
    FinancialAccountService,
} from '@/features/accounts/services/financial-account-service';
import { ITreeFinancialAccountSearchRow } from '@/features/accounts/types';
import { TranslatePipe } from '@ngx-translate/core';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { TooltipModule } from 'primeng/tooltip';
import { A4PrintService } from '@/core';

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
        NgSelectComponent,
        TranslatePipe,
        LoadingDisabledDirective,
        TooltipModule,
    ],
    templateUrl: './purchases-form.html',
    styleUrl: './purchases-form.css',
})
export class PurchasesForm extends BaseComponent {
    PaymentType = OrderPaymentType;

    // ── Core state ────────────────────────────────────────────────────────────

    currentPurchase = signal<IPurchaseReadResponse | null>(null);
    purchaseService = inject(PurchaseService);
    id = input<number | null>(null);

    formMode = computed(() => {
        if (this.currentPurchase()) return FormMode.Update;
        return this.initialFormMode();
    });

    // ── Form definition ───────────────────────────────────────────────────────

    initialFormValue = {
        referenceNumber: this.fb.control<string | null>(null, [
            Validators.maxLength(16),
            onlyNumbersOrEnLettersAllowed,
        ]),
        invoiceNumber: this.fb.control<string | null>({ value: null, disabled: true }, []),
        paymentType: this.fb.control<number | null>(OrderPaymentType.Paid, [Validators.required]),
        invoiceDate: this.fb.control<Date | string | null>(new Date(), [Validators.required]),
        notes: this.fb.control<string | null>(null, [Validators.maxLength(1000)]),
        items: this.fb.array<FormGroup<IAppPurchaseItemControls>>([], [Validators.required, Validators.minLength(1)]),
        supplierId: this.fb.control<number | null>(null, [Validators.required]),
        supplierName: this.fb.control<string | null>({ value: null, disabled: true }, [Validators.maxLength(100)]),
        supplierPhoneNumber: this.fb.control<string | null>(null, []),
        supplierTaxNumber: this.fb.control<string | null>(null, []),
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
    };
    fg = this.fb.group(this.initialFormValue);

    // ── Payment type listener ─────────────────────────────────────────────────

    isPaidListener = this.fg.controls.paymentType.valueChanges.subscribe({
        next: (value) => {
            const controls = [
                this.fg.controls.cashAmount,
                this.fg.controls.networkAmount,
                this.fg.controls.cashAccountId,
                this.fg.controls.networkAccountId,
            ];
            if (value == OrderPaymentType.Paid) {
                controls.forEach((c) => {
                    c.setValue(null);
                    c.enable();
                });
                // Re-apply defaults for new invoices after controls are cleared & enabled
                if (this.formMode() === FormMode.Create) {
                    setTimeout(() => this._applyDefaultAccountsToForm());
                }
            } else {
                controls.forEach((c) => {
                    c.setValue(null);
                    c.disable();
                });
            }
            this.paymentType.set(value!);
        },
    });

    // ── Reactive totals ───────────────────────────────────────────────────────

    private _itemsChange = toSignal(this.fg.controls.items.valueChanges, { initialValue: null });

    net = signal(0);
    paymentType = signal(OrderPaymentType.Paid);

    updateNet = () => {
        const total = this.fg.controls.items.value?.reduce((acc, item) => acc + (item.total ?? 0), 0) ?? 0;
        this.net.set(+total);
    };

    totalQuantity = computed(() => {
        this._itemsChange();
        return this.fg.controls.items.controls.reduce((sum, ctrl) => sum + (Number(ctrl.value.quantity) || 0), 0);
    });

    totalTax = computed(() => {
        this._itemsChange();
        return this.fg.controls.items.controls.reduce(
            (sum, ctrl) => sum + (Number(ctrl.value.taxAmount) || 0) * (Number(ctrl.value.quantity) || 0),
            0,
        );
    });

    finalNet = computed(() => (this.fg.value.paymentType === OrderPaymentType.Paid ? this.net() : 0));

    // ── Cash / network amount cross-update ────────────────────────────────────

    cashInputSubscription = this.fg.controls.cashAmount.valueChanges.subscribe((value) => {
        const net = this.finalNet();
        let v = value ?? 0;
        if (v > net) v = net;
        if (v < 0) v = 0;
        this.fg.patchValue({ networkAmount: net - v, cashAmount: v }, { emitEvent: false });
    });

    networkInputSubscription = this.fg.controls.networkAmount.valueChanges.subscribe((value) => {
        const net = this.finalNet();
        let v = value ?? 0;
        if (v > net) v = net;
        if (v < 0) v = 0;
        this.fg.patchValue({ cashAmount: net - v, networkAmount: v }, { emitEvent: false });
    });

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor() {
        super();
        this.searchProducts(1);
        this.setUpNewPurchaseDetailRowFg();
        this.financialAccountService.getCashAndBankAccountsAndCustodyAccounts().subscribe({
            next: (res) => {
                this.cashAccounts.set(res.cash);
                this.networkAccounts.set(res.bank);

                const userDetails = this.userDetails();
                if (userDetails?.cashPaymentAccountId) {
                    this.fg.patchValue({
                        cashAccountId: userDetails.cashPaymentAccountId,
                    });
                }
                if (userDetails?.bankPaymentAccountId) {
                    this.fg.patchValue({
                        networkAccountId: userDetails.bankPaymentAccountId,
                    });
                }
            },
        });

        // Load all suppliers initially so the dropdown is pre-populated
        this.supplierService
            .search({
                paginationInfo: { pageIndex: 0, pageSize: 0 },
                searchFilters: [{ column: SupplierSearchEnum.Name, values: [''] }],
                fromDate: null,
            })
            .subscribe({
                next: (res) => {
                    this.suppliersByName.set(res.value.rows);
                    this.supplierService.getDefaultSupplier().subscribe({
                        next: (res) => {
                            this.fg.patchValue({ supplierId: res.id });
                        },
                    });
                },
            });

        // Phase 3 — Date must never be empty: restore current date if cleared
        this.fg.controls.invoiceDate.valueChanges.subscribe((value) => {
            if (!value) {
                this.fg.controls.invoiceDate.setValue(new Date(), { emitEvent: false });
            }
        });
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

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
                        this._setCurrentSupplierFromPurchase(data);
                        this.currentProducts.set(
                            data.items.map((item) => ({ id: item.menuItemsId, name: item.menuItemName })),
                        );
                        this.fg.setControl(
                            'items',
                            this.fb.array(
                                data.items.map((item) => {
                                    this.getProductUnits(item.menuItemsId);
                                    return this.createItemFg({
                                        menuItemsId: item.menuItemsId,
                                        unitId: item.unitId,
                                        quantity: item.quantity,
                                        purchasePrice: item.purchasePrice,
                                        salePrice: item.salePrice,
                                        taxAmount: item.quantity > 0 ? item.taxAmount / item.quantity : 0,
                                        taxPercentage: -1,
                                        total: null,
                                    });
                                }),
                            ),
                        );
                        this.updateNet();
                    },
                });
                break;
        }
    }

    // ── Submit ────────────────────────────────────────────────────────────────

    onSubmitPurchase() {
        if (this.fg.invalid) {
            this.fg.markAllAsTouched();
            return;
        }
        if (!this.fg.value.supplierId) {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'يجب اختيار المورد' });
            return;
        }
        if (this.fg.controls.items.length === 0) {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'يجب إضافة صنف واحد على الأقل' });
            return;
        }

        const fgValue = this.fg.getRawValue();
        const data = {
            ...fgValue,
            cashAmount: +(fgValue.cashAmount || 0).toFixed(2),
            networkAmount: +(fgValue.networkAmount || 0).toFixed(2),
            invoiceDate: this.UtcToLocalIso((fgValue.invoiceDate as Date)!.toISOString()),
            items: fgValue.items?.map((item: any) => ({
                ...item,
                quantity: +item.quantity,
                taxAmount: +(item.taxAmount * item.quantity).toFixed(2),
                salePrice: +(item.salePrice ?? item.purchasePrice + item.taxAmount).toFixed(2),
                purchasePrice: +item.purchasePrice.toFixed(2),
            })),
        };

        switch (this.formMode()) {
            case FormMode.Create:
                this.purchaseService.create(data).subscribe({
                    next: () => {
                        this.router.navigate(['/storage/purchases']);
                    },
                });
                break;
            case FormMode.Update:
                this.purchaseService.put({ ...data, id: this.currentPurchase()?.id }).subscribe();
                break;
        }
    }

    // ── Invoice search by number ──────────────────────────────────────────────

    debouncedFindPurchaseInvoiceByNumber(event: any, invoiceNumber: string) {
        if (!invoiceNumber) return;
        this.purchaseService.getByInvoiceNumber(invoiceNumber).subscribe({
            next: (data) => {
                this.currentPurchase.set(data);
                this.fg.patchValue({ ...data, invoiceDate: new Date(data.invoiceDate) });
                this._setCurrentSupplierFromPurchase(data);
                this.currentProducts.set(data.items.map((item) => ({ id: item.menuItemsId, name: item.menuItemName })));
                this.fg.setControl(
                    'items',
                    this.fb.array(
                        data.items.map((item) => {
                            this.getProductUnits(item.menuItemsId);
                            return this.createItemFg({
                                menuItemsId: item.menuItemsId,
                                unitId: item.unitId,
                                quantity: item.quantity,
                                purchasePrice: item.purchasePrice,
                                salePrice: item.salePrice,
                                taxAmount: item.taxAmount,
                                taxPercentage: -1,
                                total: null,
                            });
                        }),
                    ),
                );
                this.updateNet();
            },
        });
    }

    private _setCurrentSupplierFromPurchase(data: IPurchaseReadResponse) {
        this.currentSupplier.set({
            id: data.supplierId,
            name: data.supplierName,
            phoneNumber: data.supplierPhoneNumber,
            taxNumber: data.supplierTaxNumber,
            secondaryMobileNumber: '',
            city: '',
            district: '',
            street: '',
            buildingNumber: '',
            apartment: '',
            landmark: '',
            postalCode: '',
            commercialRegister: '',
            numberOfFloor: 0,
            financiallyAccountId: 0,
        });
    }

    // ── Supplier search (Phase 4 & 5) ─────────────────────────────────────────

    supplierService = inject(SupplierService);
    currentSupplier = signal<ISupplierSearchRow | null>(null);

    suppliersByCode = signal<ISupplierSearchRow[]>([]);
    suppliersByName = signal<ISupplierSearchRow[]>([]);
    private _suppliersCodePage = 1;
    private _suppliersNamePage = 1;
    private _suppliersCodeTerm = '';
    private _suppliersNameTerm = '';

    displayedSuppliersByCode = computed(() => {
        const list = this.suppliersByCode();
        const current = this.currentSupplier();
        const result: (ISupplierSearchRow & { codeLabel: string })[] = list.map((s) => ({
            ...s,
            codeLabel: `${s.id} - ${s.name}`,
        }));
        if (current && !result.some((s) => s.id === current.id)) {
            result.unshift({ ...current, codeLabel: `${current.id} - ${current.name}` });
        }
        return result;
    });

    displayedSuppliersByName = computed(() => {
        const list = this.suppliersByName();
        const current = this.currentSupplier();
        if (current && !list.some((s) => s.id === current.id)) {
            return [current, ...list];
        }
        return list;
    });

    onSupplierSelected(supplier: ISupplierSearchRow) {
        if (!supplier) return;
        this.currentSupplier.set(supplier);
        this.fg.patchValue({
            supplierName: supplier.name,
            supplierPhoneNumber: supplier.phoneNumber,
            supplierTaxNumber: supplier.taxNumber,
        });
    }

    // ── Products ──────────────────────────────────────────────────────────────

    products = signal<IProductSearchRow[]>([]);
    currentProducts = signal<Partial<IProductSearchRow>[]>([]);
    productService = inject(ProductService);

    displayedProducts = computed(() => {
        const current = this.currentProducts();
        const products = this.products();
        if (!current.length) return products;
        const currentMap = new Map(current.map((a) => [a.id, a]));
        const merged = products.map((p) => (currentMap.has(p.id) ? { ...p, ...currentMap.get(p.id)! } : p));
        const missing = current.filter((c) => !products.some((p) => p.id === c.id));
        return [...missing, ...merged];
    });

    productsPaginationInfo: IPaginationInfo = { pageIndex: 0, totalPagesCount: 0, totalRowsCount: 0 };
    ProductSearchEnum = ProductSearchEnum;

    searchProducts(pageIndex: number, searchValue = '') {
        this.productService
            .search({
                paginationInfo: { pageIndex, pageSize: 20 },
                searchFilters: [
                    { column: ProductSearchEnum.Name, values: [searchValue] },
                    { column: ProductSearchEnum.Id, values: [searchValue] },
                ],
                fromDate: null,
                removeDateFilter: true,
            })
            .subscribe({
                next: (res) => {
                    const rows = res.value.menuItems.rows;
                    if (rows.length > 0) {
                        if (pageIndex === 1) this.products.set(rows);
                        else this.products.update((prev) => prev.concat(rows));
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
        if (event.type === 'scrollToEnd') {
            this.searchProducts(this.productsPaginationInfo.pageIndex + 1);
        } else {
            this.searchProducts(1, searchValue);
        }
    }

    // ── Units ─────────────────────────────────────────────────────────────────

    units = new Map<number, Signal<IProductUnit[]>>();
    unitService = inject(UnitService);

    getProductUnits(productId: number, fg: FormGroup<IAppPurchaseItemControls> = this.newPurchaseItemRowFg) {
        if (!this.units.has(productId)) {
            const unitsSignal = signal<IProductUnit[]>([]);
            this.units.set(productId, unitsSignal);
            this.productService.getUnitsByProductId(productId).subscribe({
                next: (res) => {
                    unitsSignal.set(res);
                    fg.patchValue({ unitId: res[0]?.unitId });
                },
            });
            return unitsSignal;
        }
        return this.units.get(productId)!;
    }

    // ── Table row management ──────────────────────────────────────────────────

    lastClickedTableRowIndex = signal<number | null>(null);

    deltePurchaseRow(rowIndex: number) {
        this.fg.controls.items.removeAt(rowIndex);
        this.updateNet();
    }

    /** Strip leading zeros and cap to 2 decimal places on blur. */
    normalizeAmount(control: AbstractControl) {
        const num = parseFloat(String(control.value ?? 0));
        if (isNaN(num) || num < 0) {
            control.setValue(0, { emitEvent: false });
            return;
        }
        control.setValue(parseFloat(num.toFixed(2)), { emitEvent: false });
    }

    // ── Item form group ───────────────────────────────────────────────────────

    newPurchaseItemRowFg!: FormGroup<IAppPurchaseItemControls>;

    /**
     * Total = (purchasePrice + taxAmount) × quantity.
     * taxAmount is always directly editable — no percentage override.
     */
    calculateItemTotal(data?: Partial<IAppPurchaseItem>) {
        const purchasePrice = data?.purchasePrice ?? 0;
        const taxAmount = data?.taxAmount ?? 0;
        const quantity = data?.quantity ?? 0;
        const total = (purchasePrice + taxAmount) * quantity;
        return { total };
    }

    createItemFg(data?: Partial<IAppPurchaseItem>) {
        const fg = this.fb.group<IAppPurchaseItemControls>({
            menuItemsId: this.fb.control<number | null>(data?.menuItemsId ?? null, [Validators.required]),
            unitId: this.fb.control<number | null>(data?.unitId ?? null, [Validators.required]),
            quantity: this.fb.control<number | null>(data?.quantity ?? null, [
                Validators.required,
                Validators.min(0.01),
            ]),
            purchasePrice: this.fb.control<number | null>(data?.purchasePrice ?? null, [
                Validators.required,
                Validators.min(0.01),
            ]),
            salePrice: this.fb.control<number | null>(data?.salePrice ?? null, [
                Validators.required,
                Validators.min(0),
            ]),
            total: this.fb.control<number | null>(this.calculateItemTotal(data).total, []),
            taxAmount: this.fb.control<number | null>(data?.taxAmount ?? 0, [Validators.required, Validators.min(0)]),
            taxPercentage: this.fb.control<number | null>(data?.taxPercentage ?? -1, []),
        });

        fg.valueChanges.subscribe({
            next: (values) => {
                const { total } = this.calculateItemTotal(values);
                fg.patchValue({ total }, { emitEvent: false });
                this.fg.updateValueAndValidity();
                this.updateNet();
            },
        });
        return fg;
    }

    setUpNewPurchaseDetailRowFg() {
        if (this.newPurchaseItemRowFg) {
            this.newPurchaseItemRowFg.reset({ taxAmount: 0, taxPercentage: -1 });
        } else {
            this.newPurchaseItemRowFg = this.createItemFg();
        }
    }

    addNewPurchaseItem() {
        if (this.newPurchaseItemRowFg.invalid) {
            this.newPurchaseItemRowFg.markAllAsTouched();
            return;
        }

        const fgValue = { ...this.newPurchaseItemRowFg.value };
        this.fg.controls.items.push(this.createItemFg(fgValue as IAppPurchaseItem));

        const currentProduct = this.products().find((p) => p.id === fgValue.menuItemsId);
        if (currentProduct) {
            this.currentProducts.update((pre) => [...pre.filter((p) => p.id !== fgValue.menuItemsId), currentProduct]);
        }

        this.lastClickedTableRowIndex.set(this.fg.value.items!.length - 1);
        this.setUpNewPurchaseDetailRowFg();
    }

    onItemChange(item: IProductSearchRow, fg: FormGroup<IAppPurchaseItemControls>) {
        const purchasePrice = item.costPrice > 0 ? item.costPrice / (1 + item.tax / 100) : 0;
        const taxAmount = item.costPrice - purchasePrice;
        const { total } = this.calculateItemTotal({ quantity: 1, purchasePrice, taxAmount });
        fg.patchValue({
            unitId: null,
            menuItemsId: item.id,
            quantity: 1,
            salePrice: +item.priceWithTax,
            purchasePrice: +purchasePrice.toFixed(2),
            taxAmount: +taxAmount.toFixed(2),
            taxPercentage: item.tax,
            total: +total.toFixed(2),
        });
        this.getProductUnits(item.id, fg);
    }

    // ── Accounts / payment section ────────────────────────────────────────────

    financialAccountService = inject(FinancialAccountService);
    userDetails = this.authService.userDetails;

    cashAccounts = signal<Omit<ITreeFinancialAccountSearchRow, 'stage'>[]>([]);
    networkAccounts = signal<Omit<ITreeFinancialAccountSearchRow, 'stage'>[]>([]);

    displayedCashAccounts = computed(() => {
        const accounts = this.cashAccounts();
        const userDetails = this.userDetails();
        const defaultAccount: ITreeFinancialAccountSearchRow | null = userDetails?.cashPaymentAccountId
            ? ({
                  id: userDetails.cashPaymentAccountId,
                  name: userDetails.cashPaymentAccountName ?? '',
              } as ITreeFinancialAccountSearchRow)
            : null;
        if (!defaultAccount) return [...accounts];
        const hasDefault = accounts.some((a) => a.id === defaultAccount.id);
        if (hasDefault) return [...accounts];
        return [defaultAccount, ...accounts];
    });
    displayedNetworkAccounts = computed(() => {
        const accounts = this.networkAccounts();
        const userDetails = this.userDetails();
        const defaultAccount: ITreeFinancialAccountSearchRow | null = userDetails?.bankPaymentAccountId
            ? ({
                  id: userDetails.bankPaymentAccountId,
                  name: userDetails.bankPaymentAccountName ?? '',
              } as ITreeFinancialAccountSearchRow)
            : null;
        if (!defaultAccount) return [...accounts];
        const hasDefault = accounts.some((a) => a.id === defaultAccount.id);
        if (hasDefault) return [...accounts];
        return [defaultAccount, ...accounts];
    });

    cashAccountsSearchPaginationInfo: IPaginationInfo = { pageIndex: 1, totalRowsCount: 0, totalPagesCount: 0 };
    networkAccountsSearchPaginationInfo: IPaginationInfo = { pageIndex: 1, totalRowsCount: 0, totalPagesCount: 0 };
    previousCashAccountsSearchTerm = '';
    previousNetworkAccountsSearchTerm = '';

    searchAccounts(data: { pageIndex: number; searchTerm?: string }) {
        return this.financialAccountService.search({
            paginationInfo: { pageIndex: data.pageIndex, pageSize: 10 },
            searchFilters: [{ column: FinancialAccountSearchEnum.Name, values: [data.searchTerm ?? ''] }],
            fromDate: null,
        });
    }

    onCashFinancialAccountsSearch(event: IDebounceEvent<{ term: string }>) {
        let searchTerm = event?.value?.term ?? '';
        const isNew = searchTerm !== this.previousCashAccountsSearchTerm;
        if (event.type === 'scrollToEnd') searchTerm = this.previousCashAccountsSearchTerm;
        if (searchTerm.length > 100) return;
        if (isNew) {
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
            this.searchAccounts({
                pageIndex: this.cashAccountsSearchPaginationInfo.pageIndex + 1,
                searchTerm,
            }).subscribe({
                next: (res) => {
                    if (res.value.rows.length > 0) {
                        this.cashAccounts.update((p) => p.concat(res.value.rows));
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

    onNetworkFinancialAccountsSearch(event: IDebounceEvent<{ term: string }>) {
        let searchTerm = event?.value?.term ?? '';
        const isNew = searchTerm !== this.previousNetworkAccountsSearchTerm;
        if (event.type === 'scrollToEnd') searchTerm = this.previousNetworkAccountsSearchTerm;
        if (searchTerm.length > 100) return;
        if (isNew) {
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
            this.searchAccounts({
                pageIndex: this.networkAccountsSearchPaginationInfo.pageIndex + 1,
                searchTerm,
            }).subscribe({
                next: (res) => {
                    if (res.value.rows.length > 0) {
                        this.networkAccounts.update((p) => p.concat(res.value.rows));
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

    // ── Default accounts (user-based defaults) ───────────────────────────────

    /**
     * Patches cashAccountId / networkAccountId with the user's default accounts.
     * Only runs in Create mode and only when the control is currently empty
     * (preserves manual user overrides).
     */
    private _applyDefaultAccountsToForm() {
        if (this.formMode() !== FormMode.Create) return;
        const userDetails = this.userDetails();
        if (userDetails?.cashPaymentAccountId && !this.fg.controls.cashAccountId.value) {
            this.fg.controls.cashAccountId.setValue(userDetails.cashPaymentAccountId);
        }
        if (userDetails?.bankPaymentAccountId && !this.fg.controls.networkAccountId.value) {
            this.fg.controls.networkAccountId.setValue(userDetails.bankPaymentAccountId);
        }
    }

    // ── Form reset / new invoice ──────────────────────────────────────────────

    onResetForm() {
        if (this.formMode() === FormMode.Create) {
            this.fg.reset({ invoiceDate: new Date(), paymentType: OrderPaymentType.Paid });
            this.fg.setControl('items', this.fb.array<FormGroup<IAppPurchaseItemControls>>([]));
            this.currentSupplier.set(null);
            this.currentPurchase.set(null);
            this.net.set(0);
            this.setUpNewPurchaseDetailRowFg();
        } else {
            this.router.navigateByUrl('/storage/purchases/add');
        }
    }

    // ── Print Purchase Invoice (A4 / browser print dialog) ───────────────────

    a4PrintService = inject(A4PrintService);

    printPurchaseInvoice() {
        const invoice = this.currentPurchase();
        if (!invoice) return;

        const fmt = (dateStr: string) => {
            const d = new Date(dateStr);
            return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
        };
        const money = (v: number) => (+v || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        const paymentLabel = invoice.paymentType === 1 ? 'نقدي' : 'آجل';

        const itemRows = invoice.items
            .map(
                (item, i) => `
          <tr>
            <td class="num">${i + 1}</td>
            <td>${item.menuItemName ?? '-'}</td>
            <td class="num">${item.unitName ?? '-'}</td>
            <td class="num">${item.quantity}</td>
            <td class="num">${money(item.purchasePrice)}</td>
            <td class="num">${money(item.taxAmount)}</td>
            <td class="num">${money(item.lineTotal)}</td>
          </tr>`,
            )
            .join('');

        const paymentRows =
            invoice.paymentType === 1
                ? `
          <div class="total-item">
            <span class="total-label">نقدي</span>
            <span class="total-value">${money(invoice.cashAmount)}</span>
          </div>
          <div class="total-item">
            <span class="total-label">شبكة</span>
            <span class="total-value">${money(invoice.networkAmount)}</span>
          </div>`
                : '';

        const html = `
          <div class="doc-header">
            <div class="doc-logo">🛒</div>
            <div class="doc-company">
              <div class="doc-company-name">Rest House</div>
              <div class="doc-company-sub">نظام إدارة المطاعم والحسابات</div>
            </div>
            <div class="doc-title-box">فاتورة شراء</div>
          </div>

          <div class="meta-grid">
            <div class="meta-field">
              <span class="meta-label">رقم الفاتورة:</span>
              <span class="meta-value">${invoice.invoiceNumber ?? '-'}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">التاريخ:</span>
              <span class="meta-value">${fmt(invoice.invoiceDate)}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">نوع الدفع:</span>
              <span class="meta-value">${paymentLabel}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">الرقم الدفتري:</span>
              <span class="meta-value">${invoice.referenceNumber ?? '-'}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">المورد:</span>
              <span class="meta-value">${invoice.supplierName ?? '-'}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">رقم الجوال:</span>
              <span class="meta-value">${invoice.supplierPhoneNumber ?? '-'}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">الرقم الضريبي:</span>
              <span class="meta-value">${invoice.supplierTaxNumber ?? '-'}</span>
            </div>
          </div>

          ${
              invoice.statement
                  ? `
          <div class="statement-banner mb-2">
            <span class="meta-label">البيان: </span>
            <span>${invoice.statement}</span>
          </div>`
                  : ''
          }

          <table class="lines-table">
            <thead>
              <tr>
                <th style="width:4%">#</th>
                <th style="width:30%">المنتج</th>
                <th style="width:10%">الوحدة</th>
                <th style="width:10%">الكمية</th>
                <th style="width:14%">سعر الشراء</th>
                <th style="width:12%">الضريبة</th>
                <th style="width:20%">الإجمالي</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="5" class="bold">الإجمالي</td>
                <td class="num bold">${money(invoice.taxAmount)}</td>
                <td class="num bold">${money(invoice.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="totals-box">
            <div class="total-item">
              <span class="total-label">المبلغ قبل الضريبة</span>
              <span class="total-value">${money(invoice.subTotal)}</span>
            </div>
            <div class="total-item">
              <span class="total-label">إجمالي الضريبة</span>
              <span class="total-value">${money(invoice.taxAmount)}</span>
            </div>
            <div class="total-item">
              <span class="total-label">الإجمالي الكلي</span>
              <span class="total-value">${money(invoice.totalAmount)}</span>
            </div>
            ${paymentRows}
          </div>

          <div class="sig-footer">
            <div class="sig-row">
              <div class="sig-box">
                <span class="sig-title">المستلم</span>
                <div class="sig-line"></div>
                <span class="sig-name">التوقيع / الاسم</span>
              </div>
              <div class="sig-box">
                <span class="sig-title">المورد</span>
                <div class="sig-line"></div>
                <span class="sig-name">التوقيع / الختم</span>
              </div>
              <div class="sig-box">
                <span class="sig-title">المحاسب</span>
                <div class="sig-line"></div>
                <span class="sig-name">التوقيع / الاسم</span>
              </div>
              <div class="sig-box">
                <span class="sig-title">اعتماد الإدارة</span>
                <div class="sig-line"></div>
                <span class="sig-name">التوقيع / الختم</span>
              </div>
            </div>
          </div>`;

        this.a4PrintService.print(html);
    }

    // ── Delete invoice ────────────────────────────────────────────────────────

    deletePurchase(id: number, event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'هل أنت متأكد من حذف فاتورة الشراء؟',
            header: 'حذف فاتورة الشراء',
            icon: 'pi pi-info-circle',
            rejectLabel: 'إلغاء',
            rejectButtonProps: { label: 'إلغاء', severity: 'secondary', outlined: true },
            acceptButtonProps: { label: 'حذف', severity: 'danger' },
            accept: () => {
                this.purchaseService.delete(id).subscribe({
                    next: () => {
                        this.router.navigateByUrl('/storage/purchases/add');
                    },
                });
            },
        });
    }
}
