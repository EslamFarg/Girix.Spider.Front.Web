import {
    AbstractControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import {
    Component,
    computed,
    effect,
    inject,
    input,
    signal,
} from '@angular/core';
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
import {
    FixedFinancialAccountService,
    FixedFinancialAccountRefId,
} from '@/features/settings/services/fixed-financial-account-service';

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
        TextareaModule,
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
        if (this.currentPurchaseReturn()) return FormMode.Update;
        return this.initialFormMode();
    });

    // ── Form definition ───────────────────────────────────────────────────────

    initialFormValue = {
        referenceNumber: this.fb.control<string | null>(null, [Validators.maxLength(16)]),
        invoiceNumber:   this.fb.control<string | null>({ value: null, disabled: true }, []),
        returnNumber:    this.fb.control<string | null>({ value: null, disabled: true }, []),
        purchaseInvoiceId: this.fb.control<number | null>(null, []),
        paymentType:  this.fb.control<number | null>(OrderPaymentType.Paid, [Validators.required]),
        returnDate:   this.fb.control<Date | string | null>(new Date(), [Validators.required]),
        reason:       this.fb.control<string | null>(null, [Validators.maxLength(1000)]),
        items: this.fb.array<FormGroup<IAppPurchaseReturnItemControls>>([], [Validators.required, Validators.minLength(1)]),
        cashAmount:      this.fb.control<number | null>(null, [Validators.required, Validators.min(0), onlyNumbersOrDotAllowed]),
        networkAmount:   this.fb.control<number | null>(null, [Validators.required, Validators.min(0), onlyNumbersOrDotAllowed]),
        cashAccountId:   this.fb.control<number | null>(null, [Validators.required]),
        networkAccountId: this.fb.control<number | null>(null, [Validators.required]),
        supplierId:          this.fb.control<number | null>(null, []),
        supplierName:        this.fb.control<string | null>({ value: null, disabled: true }, [Validators.maxLength(100)]),
        supplierPhoneNumber: this.fb.control<string | null>(null, []),
        supplierTaxNumber:   this.fb.control<string | null>(null, []),
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
                controls.forEach(c => { c.setValue(null); c.enable(); });
                if (this.formMode() === FormMode.Create) {
                    setTimeout(() => this._applyDefaultAccountsToForm());
                }
            } else {
                controls.forEach(c => { c.setValue(null); c.disable(); });
            }
            this.paymentType.set(value!);
        },
    });

    // ── Reactive totals ───────────────────────────────────────────────────────

    private _itemsChange = toSignal(this.fg.controls.items.valueChanges, { initialValue: null });

    totalReturnedQuantity = computed(() => {
        this._itemsChange();
        return this.fg.controls.items.controls.reduce(
            (sum, ctrl) => sum + (Number(ctrl.value.quantity) || 0), 0);
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
        this.fg.controls.returnDate.valueChanges.subscribe(value => {
            if (!value) {
                this.fg.controls.returnDate.setValue(new Date(), { emitEvent: false });
            }
        });
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    ngOnInit() {
        const purchaseId = this.id();
        switch (this.formMode()) {
            case FormMode.Create:
                this._loadDefaultAccounts();
                break;
            case FormMode.Update:
                this.purchaseReturnService.getById(purchaseId!).subscribe({
                    next: (data) => {
                        this.currentPurchaseReturn.set(data);
                        this.fg.patchValue({
                            ...data,
                            returnDate: new Date(data.returnDate),
                        });
                        this._setCurrentSupplierFromReturn(data);
                        this._fetchAndSetAccount(data.cashAccountId, 'cash');
                        this._fetchAndSetAccount(data.networkAccountId, 'network');
                        this.fg.setControl(
                            'items',
                            this.fb.array(
                                data.items.map(item => this.createItemFg({
                                    menuItemsId: item.menuItemsId,
                                    unitId: item.unitId,
                                    quantity: item.quantity,
                                    purchaseInvoiceItemId: item.purchaseInvoiceItemId,
                                })),
                            ),
                        );
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

        const data = {
            ...this.fg.getRawValue(),
            cashAmount:    +(this.fg.value.cashAmount    || 0).toFixed(2),
            networkAmount: +(this.fg.value.networkAmount || 0).toFixed(2),
            returnDate: this.UtcToLocalIso((this.fg.value.returnDate as Date)!.toISOString()),
        };

        switch (this.formMode()) {
            case FormMode.Create:
                this.purchaseReturnService.create(data).subscribe({
                    next: () => { this.router.navigate(['/storage/purchases']); },
                });
                break;
            case FormMode.Update:
                this.purchaseReturnService.put({ ...data, id: this.currentPurchaseReturn()?.id }).subscribe();
                break;
        }
    }

    // ── Invoice search ────────────────────────────────────────────────────────

    currentFilterOption = FilterOption.Purchase;

    filterMenuItems = signal<MenuItem[]>([
        {
            label: 'فاتورة مشتريات',
            command: () => { this.currentFilterOption = FilterOption.Purchase; },
        },
        {
            label: 'مرتجع مشتريات',
            command: () => { this.currentFilterOption = FilterOption.PurchaseReturn; },
        },
    ]);

    debouncedFindPurchaseInvoiceByNumber(event: any, invoiceNumber: string) {
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
                        this._setCurrentSupplierFromPurchase(data);
                        this._fetchAndSetAccount(data.cashAccountId, 'cash');
                        this._fetchAndSetAccount(data.networkAccountId, 'network');
                        this.fg.setControl(
                            'items',
                            this.fb.array(
                                data.items.map(item => this.createItemFg({
                                    menuItemsId: item.menuItemsId,
                                    quantity: item.quantity,
                                    purchaseInvoiceItemId: item.id,
                                    unitId: item.unitId,
                                })),
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
                                data.items.map(item => this.createItemFg({
                                    menuItemsId: item.menuItemsId,
                                    quantity: item.quantity,
                                    purchaseInvoiceItemId: item.purchaseInvoiceItemId,
                                    unitId: item.unitId,
                                })),
                            ),
                        );
                    },
                });
                break;
        }
    }

    private _setCurrentSupplierFromPurchase(data: IPurchaseReadResponse) {
        this.currentSupplier.set({
            id: data.supplierId, name: data.supplierName,
            phoneNumber: data.supplierPhoneNumber, taxNumber: data.supplierTaxNumber,
            secondaryMobileNumber: '', city: '', district: '', street: '',
            buildingNumber: '', apartment: '', landmark: '', postalCode: '',
            commercialRegister: '', numberOfFloor: 0, financiallyAccountId: 0,
        });
        this.fg.patchValue({ supplierPhoneNumber: data.supplierPhoneNumber, supplierTaxNumber: data.supplierTaxNumber });
    }

    private _setCurrentSupplierFromReturn(data: IPurchaseReturnReadResponse) {
        this.currentSupplier.set({
            id: data.supplierId, name: data.supplierName,
            phoneNumber: data.supplierPhoneNumber, taxNumber: data.supplierTaxNumber,
            secondaryMobileNumber: '', city: '', district: '', street: '',
            buildingNumber: '', apartment: '', landmark: '', postalCode: '',
            commercialRegister: '', numberOfFloor: 0, financiallyAccountId: 0,
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
        if (current && !list.some(s => s.id === current.id)) return [current, ...list];
        return list;
    });

    searchSuppliers(pageIndex: number, searchTerm: string) {
        this.supplierService.search({
            paginationInfo: { pageIndex, pageSize: 10 },
            searchFilters: [{ column: SupplierSearchEnum.Name, values: [searchTerm] }],
            fromDate: null,
        }).subscribe({
            next: (res) => {
                if (pageIndex === 1) this.suppliersByName.set(res.value.rows);
                else this.suppliersByName.update(p => [...p, ...res.value.rows]);
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
            unitId:      this.fb.control<number | null>(data?.unitId ?? null, [Validators.required]),
            quantity: this.fb.control<number | null>(data?.quantity ?? null, [
                Validators.required,
                Validators.min(0.01),
                onlyNumbersOrDotAllowed,
                ...(maxQty != null ? [Validators.max(maxQty)] : []),
            ]),
            purchaseInvoiceItemId: this.fb.control<number | null>(data?.purchaseInvoiceItemId ?? null, [Validators.required]),
        });
    }

    deleteReturnItem(index: number) {
        this.fg.controls.items.removeAt(index);
    }

    normalizeAmount(control: AbstractControl) {
        const num = parseFloat(String(control.value ?? 0));
        if (isNaN(num) || num < 0) { control.setValue(0, { emitEvent: false }); return; }
        control.setValue(parseFloat(num.toFixed(2)), { emitEvent: false });
    }

    // ── Accounts ──────────────────────────────────────────────────────────────

    financialAccountService = inject(FinancialAccountService);
    fixedFinancialAccountService = inject(FixedFinancialAccountService);

    cashAccounts    = signal<ITreeFinancialAccountSearchRow[]>([]);
    networkAccounts = signal<ITreeFinancialAccountSearchRow[]>([]);

    defaultCashAccount    = signal<ITreeFinancialAccountSearchRow | null>(null);
    defaultNetworkAccount = signal<ITreeFinancialAccountSearchRow | null>(null);

    displayedCashAccounts = computed(() => {
        const list = this.cashAccounts();
        const def  = this.defaultCashAccount();
        if (!def || list.some(a => a.id === def.id)) return list;
        return [def, ...list];
    });
    displayedNetworkAccounts = computed(() => {
        const list = this.networkAccounts();
        const def  = this.defaultNetworkAccount();
        if (!def || list.some(a => a.id === def.id)) return list;
        return [def, ...list];
    });

    cashAccountsSearchPaginationInfo: IPaginationInfo    = { pageIndex: 1, totalRowsCount: 0, totalPagesCount: 0 };
    networkAccountsSearchPaginationInfo: IPaginationInfo = { pageIndex: 1, totalRowsCount: 0, totalPagesCount: 0 };
    previousCashAccountsSearchTerm    = '';
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
                        this.cashAccountsSearchPaginationInfo = { pageIndex: 1, totalPagesCount: res.value.paginationInfo.totalPagesCount, totalRowsCount: res.value.paginationInfo.totalRowsCount };
                    }
                },
            });
        } else {
            this.searchAccounts({ pageIndex: this.cashAccountsSearchPaginationInfo.pageIndex + 1, searchTerm }).subscribe({
                next: (res) => {
                    if (res.value.rows.length > 0) {
                        this.cashAccounts.update(p => p.concat(res.value.rows));
                        this.cashAccountsSearchPaginationInfo = { pageIndex: this.cashAccountsSearchPaginationInfo.pageIndex + 1, totalPagesCount: res.value.paginationInfo.totalPagesCount, totalRowsCount: res.value.paginationInfo.totalRowsCount };
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
                        this.networkAccountsSearchPaginationInfo = { pageIndex: 1, totalPagesCount: res.value.paginationInfo.totalPagesCount, totalRowsCount: res.value.paginationInfo.totalRowsCount };
                    }
                },
            });
        } else {
            this.searchAccounts({ pageIndex: this.networkAccountsSearchPaginationInfo.pageIndex + 1, searchTerm }).subscribe({
                next: (res) => {
                    if (res.value.rows.length > 0) {
                        this.networkAccounts.update(p => p.concat(res.value.rows));
                        this.networkAccountsSearchPaginationInfo = { pageIndex: this.networkAccountsSearchPaginationInfo.pageIndex + 1, totalPagesCount: res.value.paginationInfo.totalPagesCount, totalRowsCount: res.value.paginationInfo.totalRowsCount };
                    }
                },
            });
        }
    }

    // ── Default accounts (Settings → Default Accounts) ────────────────────────

    private _loadDefaultAccounts() {
        this.fixedFinancialAccountService.getAll().subscribe({
            next: (res) => {
                const cashRow    = res.rows.find(r => r.refId === FixedFinancialAccountRefId.CashPayment);
                const networkRow = res.rows.find(r => r.refId === FixedFinancialAccountRefId.NetworkPayment);

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
        this.financialAccountService.search({
            paginationInfo: { pageIndex: 1, pageSize: 1 },
            searchFilters: [{ column: FinancialAccountSearchEnum.Id, values: [accountId.toString()] }],
            fromDate: null,
        }).subscribe({
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
        const cashAcc    = this.defaultCashAccount();
        const networkAcc = this.defaultNetworkAccount();
        if (cashAcc    && !this.fg.controls.cashAccountId.value)    { this.fg.controls.cashAccountId.setValue(cashAcc.id); }
        if (networkAcc && !this.fg.controls.networkAccountId.value) { this.fg.controls.networkAccountId.setValue(networkAcc.id); }
    }

    // ── Form reset / new return ───────────────────────────────────────────────

    onResetForm() {
        if (this.formMode() === FormMode.Create) {
            this.fg.reset({ returnDate: new Date(), paymentType: OrderPaymentType.Paid });
            this.fg.setControl('items', this.fb.array<FormGroup<IAppPurchaseReturnItemControls>>([]));
            this.currentSupplier.set(null);
            this.currentPurchase.set(null);
            this.currentPurchaseReturn.set(null);
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
                    next: () => { this.router.navigateByUrl('/storage/purchases-returns/add'); },
                });
            },
        });
    }

    // ── Print Purchase Return (A4 / browser dialog) ───────────────────────────

    a4PrintService = inject(A4PrintService);

    printPurchaseReturn() {
        const ret = this.currentPurchaseReturn();
        if (!ret) return;

        const fmt   = (s: string) => { const d = new Date(s); return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`; };
        const money = (v: number) => (+v||0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        const paymentLabel = ret.paymentType === 1 ? 'مدفوع' : 'معلق';

        const itemRows = ret.items.map((item, i) => `
          <tr>
            <td class="num">${i + 1}</td>
            <td>${item.menuItemName ?? '-'}</td>
            <td class="num">${item.unitName ?? '-'}</td>
            <td class="num">${item.quantity}</td>
            <td class="num">${money(item.purchasePrice)}</td>
            <td class="num">${money(item.salePrice)}</td>
            <td class="num">${money(item.taxAmount)}</td>
            <td class="num">${money(item.lineTotal)}</td>
          </tr>`).join('');

        const paymentRows = ret.paymentType === 1 ? `
          <div class="total-item"><span class="total-label">نقدي</span><span class="total-value">${money(ret.cashAmount)}</span></div>
          <div class="total-item"><span class="total-label">شبكة</span><span class="total-value">${money(ret.networkAmount)}</span></div>` : '';

        const html = `
          <div class="doc-header">
            <div class="doc-logo">↩</div>
            <div class="doc-company">
              <div class="doc-company-name">Rest House</div>
              <div class="doc-company-sub">نظام إدارة المطاعم والحسابات</div>
            </div>
            <div class="doc-title-box">مرتجع مشتريات</div>
          </div>

          <div class="meta-grid">
            <div class="meta-field"><span class="meta-label">رقم المرتجع:</span><span class="meta-value">${ret.returnNumber ?? '-'}</span></div>
            <div class="meta-field"><span class="meta-label">التاريخ:</span><span class="meta-value">${fmt(ret.returnDate)}</span></div>
            <div class="meta-field"><span class="meta-label">رقم فاتورة المشتريات:</span><span class="meta-value">${ret.purchaseInvoiceNumber ?? '-'}</span></div>
            <div class="meta-field"><span class="meta-label">نوع الدفع:</span><span class="meta-value">${paymentLabel}</span></div>
            <div class="meta-field"><span class="meta-label">الرقم الدفتري:</span><span class="meta-value">${ret.referenceNumber ?? '-'}</span></div>
            <div class="meta-field"><span class="meta-label">المورد:</span><span class="meta-value">${ret.supplierName ?? '-'}</span></div>
            <div class="meta-field"><span class="meta-label">رقم الجوال:</span><span class="meta-value">${ret.supplierPhoneNumber ?? '-'}</span></div>
            <div class="meta-field"><span class="meta-label">الرقم الضريبي:</span><span class="meta-value">${ret.supplierTaxNumber ?? '-'}</span></div>
          </div>

          ${ret.reason ? `<div class="statement-banner mb-2"><span class="meta-label">سبب الإرجاع: </span><span>${ret.reason}</span></div>` : ''}

          <table class="lines-table">
            <thead>
              <tr>
                <th style="width:4%">#</th>
                <th style="width:28%">المنتج</th>
                <th style="width:8%">الوحدة</th>
                <th style="width:8%">الكمية المرتجعة</th>
                <th style="width:13%">سعر الشراء</th>
                <th style="width:13%">سعر البيع</th>
                <th style="width:10%">الضريبة</th>
                <th style="width:16%">الإجمالي</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="bold">الإجمالي</td>
                <td class="num bold">${money(ret.taxAmount)}</td>
                <td class="num bold">${money(ret.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="totals-box">
            <div class="total-item"><span class="total-label">المبلغ قبل الضريبة</span><span class="total-value">${money(ret.subTotal)}</span></div>
            <div class="total-item"><span class="total-label">إجمالي الضريبة</span><span class="total-value">${money(ret.taxAmount)}</span></div>
            <div class="total-item"><span class="total-label">الإجمالي الكلي</span><span class="total-value">${money(ret.totalAmount)}</span></div>
            ${paymentRows}
          </div>

          <div class="sig-footer">
            <div class="sig-row">
              <div class="sig-box"><span class="sig-title">المُسلِّم</span><div class="sig-line"></div><span class="sig-name">التوقيع / الاسم</span></div>
              <div class="sig-box"><span class="sig-title">المورد</span><div class="sig-line"></div><span class="sig-name">التوقيع / الختم</span></div>
              <div class="sig-box"><span class="sig-title">المحاسب</span><div class="sig-line"></div><span class="sig-name">التوقيع / الاسم</span></div>
              <div class="sig-box"><span class="sig-title">اعتماد الإدارة</span><div class="sig-line"></div><span class="sig-name">التوقيع / الختم</span></div>
            </div>
          </div>`;

        this.a4PrintService.print(html);
    }
}
