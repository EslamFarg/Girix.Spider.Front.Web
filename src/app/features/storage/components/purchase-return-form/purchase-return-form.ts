import { AbstractControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Button, ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { DatePicker } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { BaseComponent, FormMode, IPaginationInfo } from '@/components';
import { PurchaseService } from '../../services/purchase-service';
import { IPurchaseReadResponse } from '../../types/api/purchases/responses';
import { IDebounceEvent, Debounce } from '@/directives/debounce';
import { onlyNumbersOrDotAllowed } from '@/yn-ng';
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
import { PurchaseReturnService } from '../../services/purchase-return-service';
import { IPurchaseReturnReadResponse } from '../../types/api/purchase-return/responses';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { TooltipModule } from 'primeng/tooltip';
import { A4PrintService } from '@/core';
import { buildPurchaseReturnPrintHtml } from '../../utils/purchase-return-print.util';
import {
    FixedFinancialAccountService,
    FixedFinancialAccountRefId,
} from '@/features/settings/services/fixed-financial-account-service';
import { catchError } from 'rxjs';

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
        ButtonDirective,
        InputErrorMessageHandler,
        InputGroupAddon,
        DatePicker,
        InputTextModule,
        Select,
        ReactiveFormsModule,
        Debounce,
        AllowNumbers,
        NgSelectComponent,
        TranslatePipe,
        Menu,
        LoadingDisabledDirective,
        TooltipModule,
    ],
    templateUrl: './purchase-return-form.html',
    styleUrl: './purchase-return-form.css',
})
export class PurchaseReturnForm extends BaseComponent {
    PaymentType = OrderPaymentType;

    // ── Core state ────────────────────────────────────────────────────────────

    currentPurchaseReturn = signal<IPurchaseReturnReadResponse | null>(null);
    currentPurchase = signal<IPurchaseReadResponse | null>(null);
    currentItems = computed(() => {
        if (this.currentPurchaseReturn()) return this.currentPurchaseReturn()!.items;
        if (this.currentPurchase()) return this.currentPurchase()!.items;
        return [];
    });

    purchaseReturnService = inject(PurchaseReturnService);
    purchaseService = inject(PurchaseService);
    id = input<number | null>(null);

    formMode = computed(() => {
        if (this.currentPurchaseReturn()?.id) return FormMode.Update;
        return FormMode.Create;
    });

    /** Saved record identity — only from API-loaded entity with a persisted id. */
    savedRecordId = computed(() => {
        const id = this.currentPurchaseReturn()?.id;
        if (id == null || id <= 0) {
            return null;
        }
        return id;
    });

    isNewRecord = computed(() => this.savedRecordId() === null);

    // ── Form definition ───────────────────────────────────────────────────────

    initialFormValue = {
        referenceNumber: this.fb.control<string | null>(null, [Validators.maxLength(16)]),
        invoiceNumber: this.fb.control<string | null>({ value: null, disabled: true }, []),
        returnNumber: this.fb.control<string | null>({ value: null, disabled: true }, []),
        purchaseInvoiceId: this.fb.control<number | null>(null, []),
        paymentType: this.fb.control<number | null>(OrderPaymentType.Paid, [Validators.required]),
        returnDate: this.fb.control<Date | string | null>(new Date(), [Validators.required]),
        items: this.fb.array<FormGroup<IAppPurchaseReturnItemControls>>(
            [],
            [Validators.required, Validators.minLength(1)],
        ),
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
        supplierId: this.fb.control<number | null>(null, []),
        supplierName: this.fb.control<string | null>({ value: null, disabled: true }, [Validators.maxLength(100)]),
        supplierPhoneNumber: this.fb.control<string | null>(null, []),
        supplierTaxNumber: this.fb.control<string | null>(null, []),
    };
    fg = this.fb.group(this.initialFormValue);

    // ── Payment type listener ─────────────────────────────────────────────────

    paymentType = signal(OrderPaymentType.Paid);

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

    totalReturnedQuantity = computed(() => {
        this._itemsChange();
        return this.fg.controls.items.controls.reduce((sum, ctrl) => sum + (Number(ctrl.value.quantity) || 0), 0);
    });

    totalTax = computed(() => {
        this._itemsChange();
        return this.fg.controls.items.controls.reduce((sum, ctrl, i) => {
            const orig = this.currentItems()[i];
            return sum + (orig?.taxAmount ?? 0) * (Number(ctrl.value.quantity) || 0);
        }, 0);
    });

    net = computed(() => {
        this._itemsChange();
        return this.fg.controls.items.controls.reduce((sum, ctrl, i) => {
            const orig = this.currentItems()[i];
            const qty = Number(ctrl.value.quantity) || 0;
            return sum + ((orig?.purchasePrice ?? 0) + (orig?.taxAmount ?? 0)) * qty;
        }, 0);
    });

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor() {
        super();
        this.searchAccounts({ pageIndex: 1, searchTerm: '' }).subscribe({
            next: (res) => {
                this.cashAccounts.set(res.value.rows);
                this.networkAccounts.set(res.value.rows);
            },
        });

        // Phase 7 — date must never be empty
        this.fg.controls.returnDate.valueChanges.subscribe((value) => {
            if (!value) {
                this.fg.controls.returnDate.setValue(new Date(), { emitEvent: false });
            }
        });
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    ngOnInit() {
        const returnId = this.id();
        switch (this.initialFormMode()) {
            case FormMode.Create:
                this._loadDefaultAccounts();
                this._initCreateFromQueryParams();
                break;
            case FormMode.Update:
                this.loadPurchaseReturnById(returnId!);
                break;
        }
    }

    /** Loads return from API and patches form — keeps items, enables Update mode. */
    private applyPurchaseReturnFromApi(data: IPurchaseReturnReadResponse) {
        this.currentPurchase.set(null);
        this.currentPurchaseReturn.set(data);
        this.fg.patchValue({
            ...data,
            purchaseInvoiceId: data.purchaseInvoiceId,
            invoiceNumber: data.purchaseInvoiceNumber,
            returnNumber: data.returnNumber,
            returnDate: new Date(data.returnDate),
        });
        this._setCurrentSupplierFromReturn(data);
        this._fetchAndSetAccount(data.cashAccountId, 'cash');
        this._fetchAndSetAccount(data.networkAccountId, 'network');
        this.fg.setControl(
            'items',
            this.fb.array(
                data.items.map((item) =>
                    this.createItemFg({
                        menuItemsId: item.menuItemsId,
                        unitId: item.unitId,
                        quantity: item.quantity,
                        purchaseInvoiceItemId: item.purchaseInvoiceItemId,
                    }),
                ),
            ),
        );
    }

    private loadPurchaseReturnById(id: number) {
        this.purchaseReturnService.getById(id).subscribe({
            next: (data) => this.applyPurchaseReturnFromApi(data),
        });
    }

    // ── Submit ────────────────────────────────────────────────────────────────

    onSubmitPurchase() {
        if (this.fg.invalid) {
            this.fg.markAllAsTouched();
            return;
        }

        const data = {
            ...this.fg.getRawValue(),
            cashAmount: +(this.fg.value.cashAmount || 0).toFixed(2),
            networkAmount: +(this.fg.value.networkAmount || 0).toFixed(2),
            returnDate: this.UtcToLocalIso((this.fg.value.returnDate as Date)!.toISOString()),
        };

        switch (this.formMode()) {
            case FormMode.Create:
                this.purchaseReturnService.create(data).subscribe({
                    next: (createdId) => {
                        this.loadPurchaseReturnById(createdId);
                    },
                });
                break;
            case FormMode.Update:
                this.purchaseReturnService.put({ ...data, id: this.savedRecordId()! }).subscribe({
                    next: () => {
                        this.loadPurchaseReturnById(this.savedRecordId()!);
                    },
                });
                break;
        }
    }

    // ── Invoice search ────────────────────────────────────────────────────────

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
        if (!invoiceNumber) return;

        switch (this.currentFilterOption) {
            case FilterOption.Purchase:
                this.purchaseService.getByInvoiceNumber(invoiceNumber).subscribe({
                    next: (data) => this._loadFromPurchase(data),
                    error: () => this._notifyPurchaseLoadFailed(),
                });
                break;
            case FilterOption.PurchaseReturn:
                this.purchaseReturnService.getByInvoiceNumber(invoiceNumber).subscribe({
                    next: (data) => this.applyPurchaseReturnFromApi(data),
                });
                break;
        }
    }

    /** Pre-load purchase invoice when navigated from Purchase Explorer (orders→refunds pattern). */
    private _initCreateFromQueryParams() {
        const purchaseId = Number(this.activatedRoute.snapshot.queryParamMap.get('purchaseId'));
        const invoiceNumber = this.activatedRoute.snapshot.queryParamMap.get('invoiceNumber');

        if (purchaseId && !Number.isNaN(purchaseId)) {
            this._loadPurchaseForReturnById(purchaseId);
            return;
        }

        if (invoiceNumber) {
            this.purchaseService.getByInvoiceNumber(invoiceNumber).subscribe({
                next: (data) => this._loadFromPurchase(data),
                error: () => this._notifyPurchaseLoadFailed(),
            });
        }
    }

    private _loadPurchaseForReturnById(purchaseInvoiceId: number) {
        this.purchaseReturnService
            .getPurchaseRemaining(purchaseInvoiceId)
            .pipe(catchError(() => this.purchaseService.getById(purchaseInvoiceId)))
            .subscribe({
                next: (data) => this._loadFromPurchase(data),
                error: () => this._notifyPurchaseLoadFailed(),
            });
    }

    private _loadFromPurchase(data: IPurchaseReadResponse) {
        const returnableItems = data.items.filter((item) => (item.quantity ?? 0) > 0);
        if (!returnableItems.length) {
            this.messageService.add({
                severity: 'warn',
                summary: 'مرتجع مشتريات',
                detail: 'لا توجد كميات متبقية للإرجاع في هذه الفاتورة',
            });
            return;
        }

        this.currentPurchaseReturn.set(null);
        this.currentPurchase.set({ ...data, items: returnableItems });
        this.currentFilterOption = FilterOption.Purchase;

        this.fg.patchValue({
            ...data,
            returnDate: new Date(),
            purchaseInvoiceId: data.id,
        });
        this._setCurrentSupplierFromPurchase(data);
        this._fetchAndSetAccount(data.cashAccountId, 'cash');
        this._fetchAndSetAccount(data.networkAccountId, 'network');
        this.fg.setControl(
            'items',
            this.fb.array(
                returnableItems.map((item) =>
                    this.createItemFg({
                        menuItemsId: item.menuItemsId,
                        quantity: item.quantity,
                        purchaseInvoiceItemId: item.id,
                        unitId: item.unitId,
                    }),
                ),
            ),
        );
    }

    private _notifyPurchaseLoadFailed() {
        this.messageService.add({
            severity: 'error',
            summary: 'مرتجع مشتريات',
            detail: 'تعذر تحميل فاتورة المشتريات',
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
        this.fg.patchValue({
            supplierPhoneNumber: data.supplierPhoneNumber,
            supplierTaxNumber: data.supplierTaxNumber,
        });
    }

    private _setCurrentSupplierFromReturn(data: IPurchaseReturnReadResponse) {
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

    // ── Supplier search ───────────────────────────────────────────────────────

    supplierService = inject(SupplierService);
    currentSupplier = signal<ISupplierSearchRow | null>(null);
    suppliersByName = signal<ISupplierSearchRow[]>([]);
    private _suppliersNamePage = 1;
    private _suppliersNameTerm = '';

    displayedSuppliersByName = computed(() => {
        const list = this.suppliersByName();
        const current = this.currentSupplier();
        if (current && !list.some((s) => s.id === current.id)) return [current, ...list];
        return list;
    });

    searchSuppliers(pageIndex: number, searchTerm: string) {
        this.supplierService
            .search({
                paginationInfo: { pageIndex, pageSize: 10 },
                searchFilters: [{ column: SupplierSearchEnum.Name, values: [searchTerm] }],
                fromDate: null,
            })
            .subscribe({
                next: (res) => {
                    if (pageIndex === 1) this.suppliersByName.set(res.value.rows);
                    else this.suppliersByName.update((p) => [...p, ...res.value.rows]);
                    this._suppliersNamePage = pageIndex;
                },
            });
    }

    onSupplierNameSearch(event: IDebounceEvent, searchTerm: string) {
        if (event.type === 'scrollToEnd') {
            this.searchSuppliers(this._suppliersNamePage + 1, this._suppliersNameTerm);
        } else {
            this._suppliersNameTerm = searchTerm ?? '';
            this.searchSuppliers(1, this._suppliersNameTerm);
        }
    }

    onSupplierSelected(supplier: ISupplierSearchRow) {
        if (!supplier) return;
        this.currentSupplier.set(supplier);
        this.fg.controls.supplierId.setValue(supplier.id);
        this.fg.patchValue({
            supplierName: supplier.name,
            supplierPhoneNumber: supplier.phoneNumber,
            supplierTaxNumber: supplier.taxNumber,
        });
    }

    // ── Item FormGroups ───────────────────────────────────────────────────────

    createItemFg(data?: Partial<IAppPurchaseReturnItem>) {
        const maxQty = data?.quantity ?? null;
        return this.fb.group<IAppPurchaseReturnItemControls>({
            menuItemsId: this.fb.control<number | null>(data?.menuItemsId ?? null, [Validators.required]),
            unitId: this.fb.control<number | null>(data?.unitId ?? null, [Validators.required]),
            quantity: this.fb.control<number | null>(data?.quantity ?? null, [
                Validators.required,
                Validators.min(0.01),
                onlyNumbersOrDotAllowed,
                ...(maxQty != null ? [Validators.max(maxQty)] : []),
            ]),
            purchaseInvoiceItemId: this.fb.control<number | null>(data?.purchaseInvoiceItemId ?? null, [
                Validators.required,
            ]),
        });
    }

    deleteReturnItem(index: number) {
        this.fg.controls.items.removeAt(index);
    }

    normalizeAmount(control: AbstractControl) {
        const num = parseFloat(String(control.value ?? 0));
        if (isNaN(num) || num < 0) {
            control.setValue(0, { emitEvent: false });
            return;
        }
        control.setValue(parseFloat(num.toFixed(2)), { emitEvent: false });
    }

    // ── Accounts ──────────────────────────────────────────────────────────────

    financialAccountService = inject(FinancialAccountService);
    fixedFinancialAccountService = inject(FixedFinancialAccountService);

    cashAccounts = signal<ITreeFinancialAccountSearchRow[]>([]);
    networkAccounts = signal<ITreeFinancialAccountSearchRow[]>([]);

    defaultCashAccount = signal<ITreeFinancialAccountSearchRow | null>(null);
    defaultNetworkAccount = signal<ITreeFinancialAccountSearchRow | null>(null);

    displayedCashAccounts = computed(() => {
        const list = this.cashAccounts();
        const def = this.defaultCashAccount();
        if (!def || list.some((a) => a.id === def.id)) return list;
        return [def, ...list];
    });
    displayedNetworkAccounts = computed(() => {
        const list = this.networkAccounts();
        const def = this.defaultNetworkAccount();
        if (!def || list.some((a) => a.id === def.id)) return list;
        return [def, ...list];
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

    // ── Default accounts (Settings → Default Accounts) ────────────────────────

    private _loadDefaultAccounts() {
        this.fixedFinancialAccountService.getAll().subscribe({
            next: (res) => {
                const cashRow = res.rows.find((r) => r.refId === FixedFinancialAccountRefId.CashPayment);
                const networkRow = res.rows.find((r) => r.refId === FixedFinancialAccountRefId.NetworkPayment);

                if (cashRow && cashRow.refFinancalId > 0) {
                    this._fetchAndSetAccount(cashRow.refFinancalId, 'cash');
                }
                if (networkRow && networkRow.refFinancalId > 0) {
                    this._fetchAndSetAccount(networkRow.refFinancalId, 'network');
                }
            },
        });
    }

    private _fetchAndSetAccount(accountId: number, type: 'cash' | 'network') {
        if (!accountId) return;
        this.financialAccountService
            .search({
                paginationInfo: { pageIndex: 1, pageSize: 1 },
                searchFilters: [{ column: FinancialAccountSearchEnum.Id, values: [accountId.toString()] }],
                fromDate: null,
            })
            .subscribe({
                next: (r) => {
                    const acc = r.value.rows[0];
                    if (!acc) return;
                    if (type === 'cash') {
                        this.defaultCashAccount.set(acc);
                        this._applyDefaultAccountsToForm();
                    } else {
                        this.defaultNetworkAccount.set(acc);
                        this._applyDefaultAccountsToForm();
                    }
                },
            });
    }

    private _applyDefaultAccountsToForm() {
        if (this.formMode() !== FormMode.Create) return;
        const cashAcc = this.defaultCashAccount();
        const networkAcc = this.defaultNetworkAccount();
        if (cashAcc && !this.fg.controls.cashAccountId.value) {
            this.fg.controls.cashAccountId.setValue(cashAcc.id);
        }
        if (networkAcc && !this.fg.controls.networkAccountId.value) {
            this.fg.controls.networkAccountId.setValue(networkAcc.id);
        }
    }

    // ── Form reset / new return ───────────────────────────────────────────────

    onResetForm() {
        if (!this.savedRecordId()) {
            this.fg.reset({ returnDate: new Date(), paymentType: OrderPaymentType.Paid });
            this.fg.setControl('items', this.fb.array<FormGroup<IAppPurchaseReturnItemControls>>([]));
            this.currentSupplier.set(null);
            this.currentPurchase.set(null);
            this.currentPurchaseReturn.set(null);
            this._loadDefaultAccounts();
        } else {
            this.router.navigateByUrl('/storage/purchases-returns/add');
        }
    }

    // ── Delete return ─────────────────────────────────────────────────────────

    deletePurchaseReturn(id: number, event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'هل أنت متأكد من حذف مرتجع المشتريات؟',
            header: 'حذف مرتجع المشتريات',
            icon: 'pi pi-info-circle',
            rejectLabel: 'إلغاء',
            rejectButtonProps: { label: 'إلغاء', severity: 'secondary', outlined: true },
            acceptButtonProps: { label: 'حذف', severity: 'danger' },
            accept: () => {
                this.purchaseReturnService.delete(id).subscribe({
                    next: () => {
                        this.router.navigateByUrl('/storage/purchases-returns/add');
                    },
                });
            },
        });
    }

    // ── Print Purchase Return (A4 / browser dialog) ───────────────────────────

    a4PrintService = inject(A4PrintService);

    printPurchaseReturn() {
        const ret = this.currentPurchaseReturn();
        if (!ret) return;

        this.a4PrintService.print(buildPurchaseReturnPrintHtml(ret));
    }
}
