import { ReceiptTemplateService } from '../../services/receipt-template-service';
import { Component, computed, effect, inject, input, OnInit, signal, viewChild, viewChildren } from '@angular/core';
import { OrderSuccessDialog } from '../../components/order-success-dialog/order-success-dialog';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { ImgFallback } from '@/directives/img-fallback';
import { ButtonDirective } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { IOrderBillReadResponse } from '@/features/orders';
import { SkeletonModule } from 'primeng/skeleton';
import {
    FormControl,
    Validators,
    ɵInternalFormsSharedModule,
    ReactiveFormsModule,
    ValidatorFn,
    FormsModule,
    FormGroup,
} from '@angular/forms';
import { IProductSearchRow, ProductService, ProductSearchEnum } from '@/features/classes/services/product-service';
import { GroupService, IGroupSearchRow } from '@/features/classes/services/group-service';
import { AllowNumbers } from '@/directives/allow-numbers';
import { GalleriaModule } from 'primeng/galleria';
import { Slider, BaseComponent, FormMode, IPaginationInfo } from '@/components';
import {
    IOrderCreateCustomer,
    IOrderCreateItem,
    OrderPaymentType,
    OrderLocalType,
    OrderService,
    OrderLocationType,
    IOrderCreateItemAddon,
} from '@/features/orders/index';
import { IOrderMenuItem, Menu } from '../../components/menu/menu';
import { Debounce } from '@/directives/debounce';
import { OrderCalculationsService } from '../../services/order-calculations-service';
import { TranslatePipe } from '@ngx-translate/core';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { ICustomerSearchRow } from '@/features/customers/services/customer-types';
import { CustomerSearchEnum, CustomerService } from '@/features/customers/services/customer-service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { PrinterService, IPrintJob, AppPrinterType, IAppPrinter } from '@/features/printers';
import { PrinterSettingsService } from '@/features/printers/services/printer-settings-service';
import { PrintOptions } from '@/features/printers/components/print-options/print-options';
import { PosNumericPopup } from '../../components/pos-numeric-popup/pos-numeric-popup';
import { PrintableOrderInvoice } from '@/features/orders/components/printable-order-invoice/printable-order-invoice';
import {
    FinancialSettingsService,
    IFinancialSettingsResponse,
} from '@/features/settings/services/financial-settings-service';
import {
    labeledRequiredValidator,
    noSymbolsAllowed,
    onlyLettersAllowed,
    onlyNumbersAllowed,
    onlyNumbersOrDotAllowed,
} from '@/yn-ng/utils/text-validators';
import { AmountType } from '@/core/enums';
import {
    DeliverySearchEnum,
    DeliveryService,
    IDeliverySearchRow,
} from '@/features/deliveries/services/delivery-service';
import { RouterLink } from '@angular/router';
import { FinancialAccountService } from '@/features/accounts/services/financial-account-service';
import { IFinancialAccountSearchRow, ITreeFinancialAccountSearchRow } from '@/features/accounts/types';
import { AllowedRolesDirective } from '@/directives/allowed-roles';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { DecimalMask } from '@/directives/decimal-mask';
import { ChosenLocalPlace } from '@/components/local-place-select/local-place-select';
import { DialogType } from '@/features/dialogs/enums';
import { ControlsOf, NullablePropsOf } from '@/yn-ng/types/helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { RestaurantInfoService } from '@/features/settings/services/restaurant-info-service';
import {
    IPosPaymentPreferences,
    PosPaymentPreferencesService,
    PosPaymentSplit,
} from '../../services/pos-payment-preferences.service';

//this interface has the same keys as IOrderCreateRequest but different valeus
interface IOrderCreateFgValue {
    orderType: FormControl<OrderLocationType>;
    paymentType: FormControl<OrderPaymentType>;
    placeType: FormControl<OrderLocalType | null>;
    placeRefId: FormControl<number | null>;
    durationMinutes: FormControl<number | null>;
    deliveryId: FormControl<number | null>;
    payingCash: FormControl<number | null>;
    payingNetwork: FormControl<number | null>;
    createAt: FormControl<string>;
    idempotencyKey: FormControl<string>;
    items: FormControl<IOrderCreateItem[]>;
    customerRequest: FormGroup<ControlsOf<NullablePropsOf<IOrderCreateCustomer>>>;
    placeName: FormControl<string | null>;
    cashAccountId: FormControl<number | null>;
    networkAccountId: FormControl<number | null>;
}

@Component({
    selector: 'app-home',
    imports: [
        Menu,
        OrderSuccessDialog,
        ButtonModule,
        ReactiveFormsModule,
        Dialog,
        InputTextModule,
        AvatarModule,
        ImgFallback,
        DrawerModule,
        AllowNumbers,
        ɵInternalFormsSharedModule,
        ReactiveFormsModule,
        Debounce,
        GalleriaModule,
        Slider,
        TranslatePipe,
        InputErrorMessageHandler,
        ButtonDirective,
        NgSelectComponent,
        FormsModule,
        SkeletonModule,
        RouterLink,
        PrintableOrderInvoice,
        AllowedRolesDirective,
        LoadingDisabledDirective,
        InputGroupAddon,
        DecimalMask,
        PrintOptions,
        PosNumericPopup,
    ],
    templateUrl: './cashier.html',
    styleUrls: ['./cashier.css', './payment-modal.css'],
})
export class Cashier extends BaseComponent implements OnInit {
    receiptTemplateService = inject(ReceiptTemplateService);
    //
    //
    // enums
    //
    OrderLocationType = OrderLocationType;
    OrderLocalType = OrderLocalType;
    OrderPaymentType = OrderPaymentType;
    //
    //
    // state
    //
    formMode = signal<FormMode>(FormMode.Create);
    isCreateMode = computed(() => this.formMode() == FormMode.Create);
    userDetails = this.authService.userDetails;
    //
    //
    //
    id = input<number>();
    //
    //
    // order
    //
    orderService = inject(OrderService);
    financialSettingsService = inject(FinancialSettingsService);
    existingOrderBill = signal<IOrderBillReadResponse | null>(null);

    // Print dialog
    printService = inject(PrinterService);
    printerSettingsService = inject(PrinterSettingsService);
    restaurantInfoService = inject(RestaurantInfoService);
    posPaymentPreferencesService = inject(PosPaymentPreferencesService);
    restaurantName = signal<string>('ÙØ§ØªÙˆØ±Ø© ÙƒØ§Ø´ÙŠØ±');
    // printBill = signal<IOrderBillReadResponse | null>(null);
    printableOrderInvoice = viewChild<PrintableOrderInvoice>('printableOrderInvoice');

    orderCreateItems = computed<IOrderCreateItem[]>(() => {
        return this.orderMenuItems().map((item) => ({
            menuItemId: item.menuItem?.product?.id ?? null,
            mealId: item.menuItem.meal?.id ?? null,
            quantity: item.menuItem.quantity,
            addons: item.additions.map(
                (addition) =>
                    ({
                        additionalMenuItemId: Number(addition.product.id) ?? 0,
                        quantity: addition.quantity,
                    }) satisfies IOrderCreateItemAddon,
            ),
        }));
    });
    initialOrderFgValue: IOrderCreateFgValue = {
        orderType: this.fb.control<OrderLocationType>(OrderLocationType.Takeaway, [Validators.required]),
        paymentType: this.fb.control<OrderPaymentType>(OrderPaymentType.Paid, [Validators.required]),
        placeType: this.fb.control<OrderLocalType | null>(null, []),
        placeName: this.fb.control<string | null>(null, []),
        // hut/room/table id
        placeRefId: this.fb.control<number | null>(null, []),
        durationMinutes: this.fb.control<number | null>(null, []),
        deliveryId: this.fb.control<number | null>(null, []),
        payingCash: this.fb.control<number | null>(null, [Validators.required, onlyNumbersOrDotAllowed]),
        payingNetwork: this.fb.control<number | null>(null, [Validators.required, onlyNumbersOrDotAllowed]),
        createAt: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
        idempotencyKey: this.fb.control<string>(Date.now() + Math.random().toString(), [Validators.required]),
        cashAccountId: this.fb.control<number | null>(null, [Validators.required]),
        networkAccountId: this.fb.control<number | null>(null, [Validators.required]),
        items: this.fb.control<IOrderCreateItem[]>(
            [],
            [Validators.minLength(1), labeledRequiredValidator('ÙŠØ¬Ø¨ Ø§Ø®ØªÙŠØ§Ø± ØµÙ†Ù', 'you must select an item')],
        ),
        customerRequest: this.fb.group({
            id: this.fb.control<number | null>(null, []),
            nameAr: this.fb.control<string | null>(null, []),
            nameEn: this.fb.control<string | null>(null, []),
            phoneNumber: this.fb.control<string | null>(null, [onlyNumbersAllowed, Validators.maxLength(16)]),
            secondaryMobileNumber: this.fb.control<string | null>(null),
            addressDescription: this.fb.control<string | null>(null, [noSymbolsAllowed, Validators.maxLength(150)]),
        }),
    };

    registerValidators() {
        const { orderType, paymentType, payingCash, payingNetwork, createAt, idempotencyKey, items } =
            this.orderFg.controls;
        items.setValidators([
            Validators.minLength(1),
            labeledRequiredValidator('ÙŠØ¬Ø¨ Ø§Ø®ØªÙŠØ§Ø± ØµÙ†Ù', 'you must select an item'),
        ]);
        switch (this.formMode()) {
            case FormMode.Create:
                payingCash.setValidators([Validators.required]);
                payingNetwork.setValidators([Validators.required]);
                createAt.setValidators([Validators.required]);
                orderType.setValidators([Validators.required]);
                paymentType.setValidators([Validators.required]);
                idempotencyKey.setValidators([Validators.required]);
                break;
            case FormMode.Update:
                break;
        }
    }

    orderFg = this.fb.group(this.initialOrderFgValue);
    orderCalculationsService = inject(OrderCalculationsService);
    getMenuItemTaxValue = this.orderCalculationsService.getMenuItemTaxValue;
    getMenuItemNetValue = this.orderCalculationsService.getMenuItemNetValue;
    getMenuItemPriceWithAdditionsWithSelectiveTax =
        this.orderCalculationsService.getMenuItemPriceWithAdditionsWithSelectiveTax;
    getMenuItemPriceWithSelectiveTaxWithoutAdditions =
        this.orderCalculationsService.getMenuItemPriceWithSelectiveTaxWithoutAdditions;
    getMenuItemUnitPriceWithoutAdditionsWithSelectiveTax =
        this.orderCalculationsService.getMenuItemUnitPriceWithoutAdditionsWithSelectiveTax;
    getMenuItemUnitPriceWithoutAdditionsWithTax =
        this.orderCalculationsService.getMenuItemUnitPriceWithoutAdditionsWithTax;
    orderMenuItems = signal<IOrderMenuItem[]>([]);

    financialSettings = signal<IFinancialSettingsResponse>({
        deliveryFee: 0,
        deliveryFeeType: 1,
        discount: 0,
        discountType: 1,
        serviceFee: 0,
        serviceFeeType: 1,
        vat: 0,
        minimumSelectiveTax: 0,
    });

    constructor() {
        super();
        this.groupsService.getList(true, { pageIndex: 0, pageSize: 0 }).subscribe({
            next: (res) => {
                this.groups.set(res.rows);
            },
        });

        this.financialSettingsService.getSettings().subscribe((res) => this.financialSettings.set(res));
        this.resetData();
        this.getAccounts().subscribe({
            next: (res) => {
                this.cashAccounts.set(res.cash);
                this.networkAccounts.set(res.bank);

                const userDetails = this.userDetails();
                if (userDetails?.cashPaymentAccountId) {
                    this.orderFg.patchValue({
                        cashAccountId: userDetails.cashPaymentAccountId,
                    });
                }
                if (userDetails?.bankPaymentAccountId) {
                    this.orderFg.patchValue({
                        networkAccountId: userDetails.bankPaymentAccountId,
                    });
                }
            },
        });
        // this.searchAdditions(1);
        this.restaurantInfoService.getSettings().subscribe({
            next: (res) => {
                this.restaurantName.set(res.nameAr ?? 'ÙØ§ØªÙˆØ±Ø© ÙƒØ§Ø´ÙŠØ±');
            },
            error: () => {
                this.restaurantName.set('ÙØ§ØªÙˆØ±Ø© ÙƒØ§Ø´ÙŠØ±');
            }
        });
        // Pre-load customers so the dropdown isn't empty when dialog opens
        this.searchCustomers({ pageIndex: 1 });
        // Default to cash customer
        this.setSelectedCustomer(this.cashCustomer);

        this.orderTypeControl?.valueChanges.subscribe((orderType) => {
            const { placeRefId, deliveryId, paymentType } = this.orderFg.controls;
            this.requireCustomer(false);

            this.orderLocationType.set(orderType);

            switch (orderType) {
                case OrderLocationType.Takeaway:
                    paymentType.setValue(OrderPaymentType.Paid);
                    paymentType.disable();
                    this.orderFg?.patchValue({
                        placeRefId: null,
                        deliveryId: null,
                        placeType: null,
                        durationMinutes: null,
                    });
                    this.chosenLocalPlace.set(null);
                    placeRefId?.clearValidators();
                    deliveryId?.clearValidators();
                    break;

                // 1. Shared logic runs first for all three types
                case OrderLocationType.PersonDelivery:
                case OrderLocationType.CompanyDelivery:
                case OrderLocationType.DineIn:
                    // No break here! Execution falls through to the next matching case.

                    // 2. Specific logic follows
                    switch (orderType) {
                        case OrderLocationType.PersonDelivery:
                        case OrderLocationType.CompanyDelivery:
                            placeRefId?.clearValidators();
                            this.orderFg?.patchValue({
                                placeRefId: null,
                                placeType: null,
                                durationMinutes: null,
                            });
                            this.chosenLocalPlace.set(null);
                            deliveryId?.setValidators([
                                labeledRequiredValidator('ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø¯Ù„ÙŠÙØ±ÙŠ', 'you must select a delivery'),
                            ]);

                            switch (orderType) {
                                case OrderLocationType.PersonDelivery:
                                    this.currentCompanyDelivery.set(null);
                                    this.requireCustomer(true);
                                    paymentType.enable();
                                    console.log('OrderLocationType.PersonDelivery: paymentType.enable();');
                                    break;
                                case OrderLocationType.CompanyDelivery:
                                    paymentType.setValue(OrderPaymentType.Pending);
                                    paymentType.disable();
                                    console.log('OrderLocationType.CompanyDelivery: paymentType.disable();');
                                    this.currentDelivery.set(null);
                                    break;
                            }

                            break;
                        case OrderLocationType.DineIn:
                            paymentType.enable();
                            this.orderFg?.patchValue({
                                placeType: OrderLocalType.Table,
                                deliveryId: null,
                                durationMinutes: null,
                            });
                            console.log('OrderLocationType.DineIn: paymentType.enable();');
                            deliveryId?.clearValidators();
                            placeRefId!.setValidators([
                                labeledRequiredValidator('ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ù…ÙƒØ§Ù†', 'you must select a place'),
                            ]);
                            break;
                    }
                    break; // Breaks out of the main switch
            }

            Object.values(this.orderFg.controls).forEach((control) => {
                control.updateValueAndValidity({ emitEvent: false });
            });
        });

        this.printerSettingsService.getSettings().subscribe();
        // this.orderFg.setValidators;

        // this.orderFg.get('placeType')?.valueChanges.subscribe((placeType) => {
        //   this.localPlaceType.set(placeType);
        // });
    }

    ngOnInit(): void {
        if (this.id()) {
            this.formMode.set(FormMode.Update);
            this.orderService.getBill(this.id()!).subscribe((order) => this.existingOrderBill.set(order));
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
    //menu
    //

    isMenuVisible: boolean = false;
    groupsService = inject(GroupService);
    groups = signal<IGroupSearchRow[]>([]);
    menuComponents = viewChildren(Menu);

    //
    //#region menu items change
    //

    onMenuItemChange(changedItem: IOrderMenuItem) {
        if (changedItem.menuItem.quantity <= 0) return;

        this.orderMenuItems.update((items) => items.concat(changedItem));
    }

    onOrderMenuItemQuantityChange(index: number, newQuantity: number) {
        if (newQuantity >= 1000) {
            this.orderMenuItems.update((items) =>
                items.map((item, i) =>
                    i == index ? { ...item, menuItem: { ...item.menuItem, quantity: 1000 } } : item,
                ),
            );
            return;
        } else if (newQuantity <= 0) {
            this.orderMenuItems.update((items) => items.filter((_, i) => i != index));
        } else {
            this.orderMenuItems.update((items) =>
                items.map((item, i) =>
                    i == index ? { ...item, menuItem: { ...item.menuItem, quantity: newQuantity } } : item,
                ),
            );
        }
    }

    onRemoveOrderMenuItem(index: number) {
        this.orderMenuItems.update((items) => items.filter((_, i) => i != index));
    }

    //#endregion

    //
    //#region order form
    //

    orderFgValue = toSignal(this.orderFg.valueChanges, { initialValue: this.orderFg.getRawValue() });
    paymentTypeSignal = toSignal(this.paymentTypeControl.valueChanges, { initialValue: this.paymentTypeControl.value });
    payingCashSignal = toSignal(this.payingCashControl.valueChanges, { initialValue: this.payingCashControl.value });
    payingNetworkSignal = toSignal(this.payingNetworkControl.valueChanges, {
        initialValue: this.payingNetworkControl.value,
    });

    showReceivedAndChange = computed(
        () =>
            this.paymentTypeSignal() === OrderPaymentType.Paid && +(this.payingCashSignal() ?? 0) > 0,
    );

    get orderTypeControl() {
        return this.orderFg.controls.orderType;
    }
    get paymentTypeControl() {
        return this.orderFg.controls.paymentType;
    }
    get payingCashControl() {
        return this.orderFg.controls.payingCash;
    }
    get payingNetworkControl() {
        return this.orderFg.controls.payingNetwork;
    }

    onInitialOrderSubmit() {
        if (this.orderCreateItems().length === 0) {
            this.orderFg.markAllAsTouched();
            this.messageService.add({ severity: 'error', summary: 'Ø®Ø·Ø§Ù”', detail: 'ÙŠØ¬Ø¨ Ø§Ø®ØªÙŠØ§Ø± Ø§ØµÙ†Ø§Ù' });
            return;
        }

        switch (this.formMode()) {
            case FormMode.Create:
                this.orderFg.patchValue({
                    items: this.orderCreateItems(),
                });
                this.preparePaymentConfirmationDialog();
                this.orderConfirmationDialogVisible.set(true);
                break;
            case FormMode.Update:
                this.orderService
                    .addItems({
                        id: this.existingOrderBill()!.id,
                        items: this.orderCreateItems(),
                        dateTime: this.localDateIso,
                    })
                    .subscribe({
                        next: (res) => {
                            this.messageService.add({ severity: 'success', summary: 'Ù†Ø¬Ø§Ø­', detail: 'ØªÙ… ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨' });
                            this.resetOrderForm();
                            this.router.navigate(['/']);
                        },
                        error: (err) => {
                            console.log(err);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'ÙØ´Ù„',
                                detail: 'Ù„Ù… ÙŠØªÙ… ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨',
                            });
                            this.resetIdempotencyKey();
                        },
                    });
        }
    }

    onFinalOrderSubmit() {
        if (this.orderFg.invalid) {
            console.log('invalid order');
            Object.entries(this.orderFg.controls).forEach(([key, value]) => {
                if (value.errors) {
                    console.log(key, value.errors);
                }
            });
            this.orderFg.markAllAsTouched();
            return;
        }

        const rawValue = this.orderFg.getRawValue();
        let values: any = {
            ...rawValue,
            items: this.orderCreateItems(),
        };

        switch (rawValue.orderType) {
            case OrderLocationType.CompanyDelivery: {
                const currentCompany = this.currentCompanyDelivery();
                values = {
                    ...values,
                    deliveryId: null,
                    customerRequest: {
                        nameAr: currentCompany?.name || '',
                        phoneNumber: currentCompany?.phoneNumber || '',
                        addressDescription: currentCompany?.city || currentCompany?.district || '',
                        id: currentCompany?.id!,
                        nameEn: currentCompany?.name || '',
                        secondaryMobileNumber: currentCompany?.secondaryMobileNumber || '',
                    },
                };
                break;
            }
            case OrderLocationType.DineIn:
                if (!rawValue.placeRefId) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'ÙØ´Ù„',
                        detail: 'Ù„Ù… ÙŠØªÙ… Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ù…ÙƒØ§Ù†',
                    });
                    return;
                }
                break;
        }

        if (!values?.customerRequest?.id || values.customerRequest.id === this.cashCustomer.id) {
            values = { ...values, createAt: this.localDateIso, customerRequest: null };
        }

        switch (this.formMode()) {
            case FormMode.Create:
                this.orderService.create(values).subscribe({
                    next: (res) => {
                        this.savePaymentPreferencesFromForm();
                        this.existingOrderBill.set(res as unknown as IOrderBillReadResponse);
                        this.printOrder();
                        this.resetOrderForm();
                        this.orderConfirmationDialogVisible.set(false);
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'ÙØ´Ù„', detail: 'Ù„Ù… ÙŠØªÙ… Ø§Ù†Ø´Ø§Ø¡ Ø§Ù„Ø·Ù„Ø¨' });
                        this.resetIdempotencyKey();
                    },
                });
                break;
            case FormMode.Update:
                break;
        }
    }

    resetIdempotencyKey() {
        this.orderFg.patchValue({
            idempotencyKey: Date.now() + Math.random().toString(),
        });
    }

    resetData() {
        this.searchDeliveries(1);
    }

    resetOrderForm() {
        this.orderMenuItems.set([]);
        this.chosenLocalPlace.set(null);
        this.currentDelivery.set(null);
        this.currentCompanyDelivery.set(null);
        this.amountReceived.set(0);
        // Keep selected printers so they persist across orders
        // this.printService.selectedPrinters.set([]);
        this.setSelectedCustomer(this.cashCustomer);
        this.orderFg.patchValue({
            placeRefId: null,
            placeType: null,
            deliveryId: null,
            orderType: OrderLocationType.Takeaway,
        });
        this.orderLocationType.set(OrderLocationType.Takeaway);
        this.resetIdempotencyKey();
        this.orderFg.updateValueAndValidity();
        this.resetData();
        this.resetMenuCategories();
    }

    private resetMenuCategories() {
        this.menuComponents().forEach((menu) => menu.resetToAllCategory());
    }

    private setSelectedCustomer(customer: ICustomerSearchRow | null | undefined) {
        const selectedCustomer = customer ?? this.cashCustomer;
        const isCashCustomer = selectedCustomer.id === this.cashCustomer.id;
        const contactControls = [this.customerFg.controls.phoneNumber, this.customerFg.controls.addressDescription];

        if (isCashCustomer) {
            contactControls.forEach((control) => control.disable({ emitEvent: false }));
        } else {
            contactControls.forEach((control) => control.enable({ emitEvent: false }));
        }

        this.patchCustomerFg(selectedCustomer);

        // Auto-select first cash account for non-cash customers if no account selected yet
        if (!isCashCustomer && !this.orderFg.controls.cashAccountId.value) {
            const firstCashAccount = this.cashAccounts()[0];
            if (firstCashAccount) {
                this.orderFg.patchValue({ cashAccountId: firstCashAccount.id }, { emitEvent: false });
            }
        }
    }

    requireCustomer(isRequired: boolean) {
        const { phoneNumber, addressDescription, id } = this.orderFg.controls.customerRequest.controls;
        const customerRequestControls = { phoneNumber, addressDescription, id };

        this.allowCashCustomer.set(!isRequired);

        Object.entries(customerRequestControls).forEach(([key, control]) => {
            isRequired
                ? control.setValidators(this.customerValidators[key])
                : control.removeValidators(this.customerValidators[key]);

            control.updateValueAndValidity();
        });
    }

    //#endregion

    //
    //#region Print
    //


    /**
     * Builds category mapping for order items.
     * Fetches product categories from API to get proper group IDs.
     * Falls back to printer id if category API fails.
     */
    private async buildCategoryMap(bill: IOrderBillReadResponse): Promise<Map<number, { categoryId: number; categoryName: string; printer: any }>> {
        const categoryMap = new Map<number, { categoryId: number; categoryName: string; printer: any }>();
        
        // Check if items already have categoryId from backend
        const hasCategoryData = bill.items.some(item => item.categoryId != null);
        if (hasCategoryData) {
            for (const item of bill.items) {
                categoryMap.set(item.id, { 
                    categoryId: item.categoryId ?? 0, 
                    categoryName: item.categoryName ?? 'Ù…Ø·Ø¨Ø®',
                    printer: item.printer
                });
            }
            return categoryMap;
        }

        // Collect unique menuItemIds to fetch their categories
        const menuItemIds = [...new Set(bill.items.map(item => item.menuItemId).filter(id => id != null))];
        
        // Fetch product categories from API
        const productCategoryMap = new Map<number, { categoryId: number; categoryName: string }>();
        
        if (menuItemIds.length > 0) {
            try {
                // Search products by their IDs to get category info
                const response = await this.productService.search({
                    paginationInfo: { pageIndex: 1, pageSize: menuItemIds.length },
                    searchFilters: [{
                        column: ProductSearchEnum.Id,
                        values: menuItemIds.map(id => id.toString())
                    }],
                    fromDate: null,
                }).toPromise();
                
                if (response?.value?.menuItems?.rows) {
                    for (const product of response.value.menuItems.rows) {
                        if (product.categoryId) {
                            productCategoryMap.set(product.id, {
                                categoryId: product.categoryId,
                                categoryName: product.categoryName ?? 'Ù…Ø·Ø¨Ø®'
                            });
                        }
                    }
                }
            } catch (e) {
                console.error('[DEBUG] Failed to fetch product categories:', e);
            }
        }

        // Build category map using fetched categories or fallback to printer id
        for (const item of bill.items) {
            const productCategory = item.menuItemId ? productCategoryMap.get(item.menuItemId) : null;
            
            if (productCategory) {
                // Use product category for grouping
                categoryMap.set(item.id, {
                    categoryId: productCategory.categoryId,
                    categoryName: productCategory.categoryName,
                    printer: item.printer
                });
            } else {
                // Fallback to printer id as proxy for group
                const printerId = item.printer?.id ?? 0;
                const printerName = item.printer?.name ?? 'Ù…Ø·Ø¨Ø®';
                
                categoryMap.set(item.id, {
                    categoryId: printerId,
                    categoryName: printerName,
                    printer: item.printer
                });
            }
        }

        return categoryMap;
    }

    /**
     * Groups items and their modifiers by category/group id.
     * Each group gets printed as a separate kitchen receipt.
     * If an item has no category, it falls back to the default printer's category.
     */
    private groupItemsByCategory(
        bill: IOrderBillReadResponse,
        categoryMap: Map<number, { categoryId: number; categoryName: string; printer: any }>,
        defaultPrinter: IOrderBillReadResponse['items'][0]['printer'] | null,
    ): Map<number, { name: string; printer: IOrderBillReadResponse['items'][0]['printer']; items: IOrderBillReadResponse['items'] }> {
        const groups = new Map<
            number,
            { name: string; printer: IOrderBillReadResponse['items'][0]['printer']; items: IOrderBillReadResponse['items'] }
        >();

        for (const item of bill.items) {
            const mapped = categoryMap.get(item.id);
            const categoryId = mapped?.categoryId ?? item.categoryId ?? 0;
            const categoryName = mapped?.categoryName ?? item.categoryName ?? (defaultPrinter?.name ?? 'Ù…Ø·Ø¨Ø®');
            const itemPrinter = mapped?.printer ?? item.printer ?? defaultPrinter;
            
            if (itemPrinter != null) {
                if (!groups.has(categoryId)) {
                    groups.set(categoryId, { name: categoryName, printer: itemPrinter, items: [] });
                }
                groups.get(categoryId)!.items.push(item);
            }

            for (const modifier of item.modifiers ?? []) {
                const modPrinter = modifier.printer ?? defaultPrinter;
                if (modPrinter != null) {
                    if (!groups.has(categoryId)) {
                        groups.set(categoryId, {
                            name: categoryName,
                            printer: {
                                id: modPrinter.id,
                                name: modPrinter.name,
                                ipAddressOrMacAddress: modPrinter.ipAddressOrMacAddress,
                                port: modPrinter.port,
                                type: modPrinter.type,
                            },
                            items: [],
                        });
                    }
                    groups.get(categoryId)!.items.push({
                        ...item,
                        name: `+ ${modifier.name}`,
                        qty: modifier.qty,
                        unitPrice: modifier.unitPrice,
                        modifiers: [],
                    });
                }
            }
        }

        // DEBUG: log grouping results
        console.log('[DEBUG groupItemsByCategory] Total items:', bill.items.length);
        console.log('[DEBUG groupItemsByCategory] Groups created:', groups.size);
        console.log('[DEBUG groupItemsByCategory] Items detail:');
        for (const item of bill.items) {
            const mapped = categoryMap.get(item.id);
            console.log(`  Item ${item.id}: ${item.name} (qty=${item.qty})`);
            console.log(`    - menuItemId=${item.menuItemId}, mealId=${item.mealId}`);
            console.log(`    - item.printer.id=${item.printer?.id ?? 'NULL'}, item.printer.name=${item.printer?.name ?? 'NULL'}`);
            console.log(`    - mapped.categoryId=${mapped?.categoryId ?? 'NULL'}, mapped.categoryName=${mapped?.categoryName ?? 'NULL'}`);
        }
        for (const [id, group] of groups) {
            console.log(`  Group ${id} (${group.name}): ${group.items.length} items`);
            for (const item of group.items) {
                console.log(`    - ${item.name} (qty=${item.qty})`);
            }
        }

        return groups;
    }

    async printOrder() {
        const bill = this.existingOrderBill();
        if (!bill) return;

        const settings = this.printerSettingsService.printerSettings();
        if (!settings) return;

        // Snapshot the selection before any async work starts.
        // The cashier submit flow resets form state after kicking off printing.
        const selectedPrinters = [...this.printService.selectedPrinters()];
        if (selectedPrinters.length === 0) {
            return;
        }

        // Build category mapping from items (fetches product categories from API)
        const categoryMap = await this.buildCategoryMap(bill);

        // Check which printer roles the user has selected in the cashier confirmation dialog.
        console.log('[DEBUG printOrder] selectedPrinters:', selectedPrinters.map(p => ({ id: p.id, name: p.name, type: p.type, appPrinterType: p.appPrinterType })));

        const selectedTypes = new Set(selectedPrinters.map((p) => p.appPrinterType));
        console.log('[DEBUG printOrder] selectedTypes:', Array.from(selectedTypes));
        console.log('[DEBUG printOrder] settings:', { programPrinter: settings.programPrinter?.id, captionOrderPrinter: settings.captionOrderPrinter?.id, cashierPrinter: settings.cashierPrinter?.id });

        const jobs: IPrintJob[] = [];

        // Kitchen (programPrinter): group items by their category/group id
        // Only include if user selected programPrinter role
        if (selectedTypes.has(AppPrinterType.programPrinter) && settings.programPrinter?.id) {
            const kitchenGroups = this.groupItemsByCategory(bill, categoryMap, settings.programPrinter);
            for (const [, group] of kitchenGroups) {
                jobs.push({
                    printer: {
                        id: group.printer.id,
                        name: group.printer.name,
                        ipAddressOrMacAddress: group.printer.ipAddressOrMacAddress,
                        port: group.printer.port,
                        type: group.printer.type,
                        comPort: (group.printer as any).comPort,
                        appPrinterType: AppPrinterType.programPrinter,
                    },
                    html: this.receiptTemplateService.generateKitchenReceiptHtml(bill, group.items, group.name, this.restaurantName()).html,
                    css: this.receiptTemplateService.generateKitchenReceiptHtml(bill, group.items, group.name, this.restaurantName()).css,
                });
            }
        }

        // Captain (captionOrderPrinter): full receipt, simplified format
        // Only include if user selected captionOrderPrinter role
        if (selectedTypes.has(AppPrinterType.captionOrderPrinter) && settings.captionOrderPrinter?.id) {
            jobs.push({
                printer: {
                    id: settings.captionOrderPrinter.id,
                    name: settings.captionOrderPrinter.name,
                    ipAddressOrMacAddress: settings.captionOrderPrinter.ipAddressOrMacAddress,
                    port: settings.captionOrderPrinter.port,
                    type: settings.captionOrderPrinter.type,
                    comPort: settings.captionOrderPrinter.comPort,
                    appPrinterType: AppPrinterType.captionOrderPrinter,
                },
                html: this.receiptTemplateService.generateCaptainReceiptHtml(bill, bill.items, this.restaurantName()).html,
                css: this.receiptTemplateService.generateCaptainReceiptHtml(bill, bill.items, this.restaurantName()).css,
            });
        }

        // Cashier (cashierPrinter): full receipt, full format with prices
        // Only include if user selected cashierPrinter role
        if (selectedTypes.has(AppPrinterType.cashierPrinter) && settings.cashierPrinter?.id) {
            jobs.push({
                printer: {
                    id: settings.cashierPrinter.id,
                    name: settings.cashierPrinter.name,
                    ipAddressOrMacAddress: settings.cashierPrinter.ipAddressOrMacAddress,
                    port: settings.cashierPrinter.port,
                    type: settings.cashierPrinter.type,
                    comPort: settings.cashierPrinter.comPort,
                    appPrinterType: AppPrinterType.cashierPrinter,
                },
                html: this.receiptTemplateService.generateCashierReceiptHtml(bill, bill.items, this.restaurantName()).html,
                css: this.receiptTemplateService.generateCashierReceiptHtml(bill, bill.items, this.restaurantName()).css,
            });
        }

        console.log('[DEBUG printOrder] Total jobs created:', jobs.length);
        for (const job of jobs) {
            console.log(`  Job: printer=${job.printer.name} (id=${job.printer.id}, type=${job.printer.type}), html length=${job.html.length}`);
        }

        // If there are multiple kitchen printer groups, open dialog to let user select which ones
        const kitchenJobs = jobs.filter(j => j.printer.appPrinterType === AppPrinterType.programPrinter);
        const hasMultipleKitchenPrinters = kitchenJobs.length > 1 && 
            new Set(kitchenJobs.map(j => j.printer.id)).size > 1;
        
        // In cashier page: always print silently (no dialog)
        // The print options in the final submission dialog already let user select which roles to print
        this.printService.printNow(jobs);

    }

    // onPrint() {
    //     if (!bill) return;
    //     this.printBill.set(bill);
    //     this.openPrintDialog();
    // }

    //#endregion

    //
    //#regiongeneral calculations
    //

    orderLocationType = signal<OrderLocationType | null>(OrderLocationType.Takeaway);

    deliveryFee = computed(() => {
        if (
            this.orderLocationType() !== OrderLocationType.PersonDelivery &&
            this.orderLocationType() !== OrderLocationType.CompanyDelivery
        )
            return 0;

        const baseFeeValue = this.financialSettings()?.deliveryFee;
        let fee = 0;

        //tax

        if (this.financialSettings()?.deliveryFeeType == AmountType.Fixed) {
            fee = baseFeeValue * (1 + this.financialSettings()?.vat / 100);
        } else {
            const itemsWithSelectiveTaxSum = this.orderMenuItems().reduce(
                (total, item) => total + this.getMenuItemPriceWithAdditionsWithSelectiveTax(item),
                0,
            );

            const feeAmount = itemsWithSelectiveTaxSum * (baseFeeValue / 100);
            console.log('delivery fee before tax:', feeAmount);
            fee = feeAmount * (1 + this.financialSettings()?.vat / 100);
            console.log('delivery fee after tax:', fee);
        }

        //discount
        const baseDiscountValue = this.financialSettings()?.discount;

        if (this.financialSettings()?.discountType == AmountType.Fixed) {
            fee -= baseDiscountValue * (1 + this.financialSettings()?.vat / 100);
        } else {
            fee *= 1 - baseDiscountValue / 100;
        }

        return fee;
    });

    totalMenuItemsTax = computed(() => {
        return this.orderMenuItems().reduce((total, item) => total + this.getMenuItemTaxValue(item), 0);
    });

    serviceFee = computed(() => {
        const itemsWithSelectiveTaxSum = this.orderMenuItems().reduce(
            (total, item) => total + this.getMenuItemPriceWithAdditionsWithSelectiveTax(item),
            0,
        );
        let serviceFee = 0;
        let serviceFeeAfterTax = 0;
        if (this.financialSettings().serviceFeeType == AmountType.Percentage) {
            serviceFee = itemsWithSelectiveTaxSum * (this.financialSettings().serviceFee / 100);
            serviceFeeAfterTax = serviceFee * (1 + this.financialSettings().vat / 100);
        } else {
            serviceFeeAfterTax = this.financialSettings().serviceFee * (1 + this.financialSettings().vat / 100);
        }

        if (this.orderLocationType() !== OrderLocationType.DineIn) return 0;
        return serviceFeeAfterTax;
        // }
    });

    itemsDiscountAmount = computed(() => {
        const discountValue = this.financialSettings().discount;
        if (this.financialSettings().discountType == AmountType.Fixed) {
            return discountValue;
        } else if (this.financialSettings().discountType == AmountType.Percentage) {
            return this.orderItemsNet() * (discountValue / 100);
        } else {
            return 0;
        }
    });

    orderItemsNet = computed(() => {
        return this.orderMenuItems().reduce((total, item) => total + this.getMenuItemNetValue(item), 0);
    });

    cartTotalTax = computed(() => {
        const vatRate = this.financialSettings().vat / 100;
        const itemTax = this.totalMenuItemsTax();
        const feeWithTax = this.hutNet() + this.serviceFee() + this.deliveryFee();
        const feeTax = feeWithTax > 0 ? feeWithTax - feeWithTax / (1 + vatRate) : 0;
        const discountWithTax = this.itemsDiscountAmount();
        const discountTax = discountWithTax > 0 ? discountWithTax - discountWithTax / (1 + vatRate) : 0;
        return itemTax + feeTax - discountTax;
    });

    totalOrderQuantity = computed(() => {
        return this.orderMenuItems().reduce((total, item) => total + item.menuItem.quantity, 0);
    });

    initialNet = computed(
        () =>
            this.orderItemsNet() + this.hutNet() + this.serviceFee() + this.deliveryFee() - this.itemsDiscountAmount(),
    );

    cartSubtotalBeforeTax = computed(() => this.initialNet() - this.cartTotalTax());

    net = computed(() => {
        const net = this.initialNet();

        return this.paymentTypeSignal() === OrderPaymentType.Paid ? net : 0;
    });

    netListener = effect(() => {
        if (this.orderConfirmationDialogVisible()) {
            return;
        }

        const net = this.net();

        this.orderFg.patchValue(
            {
                payingCash: +net.toFixed(2),
                payingNetwork: 0,
            },
            { emitEvent: false },
        );
    });

    //#endregion


    //
    //#region Accounts
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

    cashAccounts = signal<Omit<IFinancialAccountSearchRow, 'stage'>[]>([]);
    networkAccounts = signal<Omit<IFinancialAccountSearchRow, 'stage'>[]>([]);

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
        // Avoid duplicate if default account is already in fetched accounts
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
        // Avoid duplicate if default account is already in fetched accounts
        const hasDefault = accounts.some((a) => a.id === defaultAccount.id);
        if (hasDefault) return [...accounts];
        return [defaultAccount, ...accounts];
    });

    getAccounts(data?: { pageIndex: number; searchTerm?: string }) {
        // return this.financialAccountService.search({
        //     paginationInfo: {
        //         pageIndex: data.pageIndex,
        //         pageSize: 10,
        //     },
        //     searchFilters: [
        //         {
        //             column: FinancialAccountSearchEnum.Name,
        //             values: [data.searchTerm ?? ''],
        //         },
        //     ],
        //     fromDate: null,
        // });
        return this.financialAccountService.getCashAndBankAccountsAndCustodyAccounts();
    }

    // cashAccountsSearchPaginationInfo: IPaginationInfo = {
    //     pageIndex: 1,
    //     totalRowsCount: 0,
    //     totalPagesCount: 0,
    // };
    // networkAccountsSearchPaginationInfo: IPaginationInfo = {
    //     pageIndex: 1,
    //     totalRowsCount: 0,
    //     totalPagesCount: 0,
    // };

    // previousCashAccountsSearchTerm: string = '';
    // previousNetworkAccountsSearchTerm: string = '';

    // onCashFinancialAccountsSearch(
    //     event: IDebounceEvent<{
    //         term: string;
    //     }>,
    // ) {
    //     let searchTerm = event?.value?.term ?? '';
    //     let isNewSearchTerm = searchTerm != this.previousCashAccountsSearchTerm;
    //     if (event.type === 'scrollToEnd') {
    //         searchTerm = this.previousCashAccountsSearchTerm;
    //     }
    //     if (searchTerm && searchTerm.length > 100) return;
    //     //
    //     //
    //     if (isNewSearchTerm) {
    //         //refetch page 1
    //         this.searchAccounts({ pageIndex: 1, searchTerm }).subscribe({
    //             next: (res) => {
    //                 if (res.value.rows.length > 0) {
    //                     this.previousCashAccountsSearchTerm = searchTerm;
    //                     this.cashAccounts.set(res.value.rows);
    //                     this.cashAccountsSearchPaginationInfo = {
    //                         pageIndex: 1,
    //                         totalPagesCount: res.value.paginationInfo.totalPagesCount,
    //                         totalRowsCount: res.value.paginationInfo.totalRowsCount,
    //                     };
    //                 }
    //             },
    //         });
    //     } else {
    //         //refetch next page
    //         this.searchAccounts({
    //             pageIndex: this.cashAccountsSearchPaginationInfo.pageIndex + 1,
    //             searchTerm,
    //         }).subscribe({
    //             next: (res) => {
    //                 if (res.value.rows.length > 0) {
    //                     this.previousCashAccountsSearchTerm = searchTerm;
    //                     this.cashAccounts.update((prev) => prev.concat(res.value.rows));
    //                     this.cashAccountsSearchPaginationInfo = {
    //                         pageIndex: this.cashAccountsSearchPaginationInfo.pageIndex + 1,
    //                         totalPagesCount: res.value.paginationInfo.totalPagesCount,
    //                         totalRowsCount: res.value.paginationInfo.totalRowsCount,
    //                     };
    //                 }
    //             },
    //         });
    //     }
    // }

    // onNetworkFinancialAccountsSearch(
    //     event: IDebounceEvent<{
    //         term: string;
    //     }>,
    // ) {
    //     let searchTerm = event?.value?.term ?? '';
    //     let isNewSearchTerm = searchTerm != this.previousNetworkAccountsSearchTerm;
    //     if (event.type === 'scrollToEnd') {
    //         searchTerm = this.previousNetworkAccountsSearchTerm;
    //     }
    //     if (searchTerm && searchTerm.length > 100) return;
    //     //
    //     //
    //     if (isNewSearchTerm) {
    //         //refetch page 1
    //         this.searchAccounts({ pageIndex: 1, searchTerm }).subscribe({
    //             next: (res) => {
    //                 if (res.value.rows.length > 0) {
    //                     this.previousNetworkAccountsSearchTerm = searchTerm;
    //                     this.networkAccounts.set(res.value.rows);
    //                     this.networkAccountsSearchPaginationInfo = {
    //                         pageIndex: 1,
    //                         totalPagesCount: res.value.paginationInfo.totalPagesCount,
    //                         totalRowsCount: res.value.paginationInfo.totalRowsCount,
    //                     };
    //                 }
    //             },
    //         });
    //     } else {
    //         //refetch next page
    //         this.searchAccounts({
    //             pageIndex: this.networkAccountsSearchPaginationInfo.pageIndex + 1,
    //             searchTerm,
    //         }).subscribe({
    //             next: (res) => {
    //                 if (res.value.rows.length > 0) {
    //                     this.previousNetworkAccountsSearchTerm = searchTerm;
    //                     this.networkAccounts.update((prev) => prev.concat(res.value.rows));
    //                     this.networkAccountsSearchPaginationInfo = {
    //                         pageIndex: this.networkAccountsSearchPaginationInfo.pageIndex + 1,
    //                         totalPagesCount: res.value.paginationInfo.totalPagesCount,
    //                         totalRowsCount: res.value.paginationInfo.totalRowsCount,
    //                     };
    //                 }
    //             },
    //         });
    //     }
    // }

    //#endregion

    //
    //#region local space
    //
    chosenLocalPlace = this.orderService.chosenLocalPlace;

    activeLocalType = signal<OrderLocalType | null>(null);

    async openLocalTypeDialog(loaclPlaceType: OrderLocalType) {
        await this.dialogService.open({
            type: DialogType.LocalPlaceSelect,
            inputs: { placeType: loaclPlaceType },
            onClose: (data: ChosenLocalPlace) => {
                if (!data?.id) return;
                this.chosenLocalPlace.set(data);
                this.activeLocalType.set(loaclPlaceType);
                this.orderLocationType.set(OrderLocationType.DineIn);
                this.orderFg.patchValue({
                    orderType: OrderLocationType.DineIn,
                    placeType: loaclPlaceType,
                    placeRefId: data.id,
                    durationMinutes: data.reservationMinutes,
                });
            },
        });
    }

    currentHutPrice = computed(() => {
        const currentPlace = this.chosenLocalPlace();
        if (!currentPlace) return 0;
        if (currentPlace.type != OrderLocalType.Hut) return 0;

        const hutHourPriceAfterVat = currentPlace.pricePerHour * (1 + this.financialSettings().vat / 100);

        return hutHourPriceAfterVat;
    });

    hutNet = computed(() => {
        const currentPlace = this.chosenLocalPlace();

        if (!currentPlace) return 0;
        if (currentPlace.type != OrderLocalType.Hut) return 0;

        const hutPricePerHour = currentPlace.pricePerHour ?? 0;
        const vat = this.financialSettings().vat;
        const minutes = currentPlace.reservationMinutes ?? 0;
        const price = hutPricePerHour * (minutes / 60);

        return price * (1 + vat / 100);
        // if (this.activeLocalType() === OrderLocalType.Hut && this.currentHut()) {
        // } else {
        //     return 0;
        // }
    });

    //#endregion

    //
    //#region deliveries
    //

    DeliveryDialogVisible: boolean = false;

    deliveryService = inject(DeliveryService);
    deliveries = signal<IDeliverySearchRow[]>([]);
    companyDeliveries = signal<ICustomerSearchRow[]>([]);
    currentDelivery = signal<IDeliverySearchRow | null>(null);
    currentCompanyDelivery = signal<ICustomerSearchRow | null>(null);
    selectedDeliveryLabel = computed(() => {
        const delivery = this.currentDelivery();
        const companyDelivery = this.currentCompanyDelivery();
        if (delivery) return delivery.name;
        if (companyDelivery) return companyDelivery.name;
        return '-';
    });

    isCompanyDelivery: boolean = false;

    changeDeliveryType(type: OrderLocationType) {
        this.isCompanyDelivery = type === OrderLocationType.CompanyDelivery;
        this.orderFg.patchValue({
            orderType: type,
            deliveryId: null,
        });
        this.searchDeliveries(1, type === OrderLocationType.CompanyDelivery);
    }

    deliveryPaginationInfo: {
        pageIndex: number;
        totalPagesCount: number;
        totalRowsCount: number;
    } = {
        pageIndex: 1,
        totalPagesCount: 0,
        totalRowsCount: 0,
    };
    searchDeliveries(pageIndex: number, isCompany: boolean = false) {
        if (isCompany) {
            this.customersService
                .search({
                    paginationInfo: {
                        pageIndex: pageIndex,
                        pageSize: 40,
                    },
                    searchFilters: [
                        {
                            column: CustomerSearchEnum.IsCompany,
                            values: ['true'],
                        },
                    ],
                    fromDate: null,
                })
                .subscribe({
                    next: (res) => {
                        if (res.value.rows.length > 0) {
                            if (pageIndex == 1) {
                                this.companyDeliveries.set(res.value.rows);
                            } else {
                                this.companyDeliveries.update((prev) => prev.concat(res.value.rows));
                            }

                            this.deliveryPaginationInfo = {
                                pageIndex,
                                totalPagesCount: res.value.paginationInfo.totalPagesCount,
                                totalRowsCount: res.value.paginationInfo.totalRowsCount,
                            };
                        }
                    },
                });
        } else {
            this.deliveryService
                .search({
                    paginationInfo: {
                        pageIndex: pageIndex,
                        pageSize: 40,
                    },
                    searchFilters: [
                        {
                            column: DeliverySearchEnum.Name,
                            values: [''],
                        },
                    ],
                    fromDate: null,
                })
                .subscribe({
                    next: (res) => {
                        if (res.value.rows.length > 0) {
                            if (pageIndex == 1) {
                                this.deliveries.set(res.value.rows);
                            } else {
                                this.deliveries.update((prev) => prev.concat(res.value.rows));
                            }
                            this.deliveryPaginationInfo = {
                                pageIndex,
                                totalPagesCount: res.value.paginationInfo.totalPagesCount,
                                totalRowsCount: res.value.paginationInfo.totalRowsCount,
                            };
                        }
                    },
                });
        }
    }
    onDeliveriesScroll(event: Event, deliveriesScroller: HTMLElement) {
        // if at bottom
        if (deliveriesScroller.scrollTop + deliveriesScroller.clientHeight >= deliveriesScroller.scrollHeight - 1) {
            this.searchDeliveries(this.deliveryPaginationInfo.pageIndex + 1);
        }
    }
    onDeliverySelected(orderType: OrderLocationType, delivery?: IDeliverySearchRow | ICustomerSearchRow) {
        this.orderLocationType.set(orderType);
        this.orderFg.patchValue({
            deliveryId: delivery?.id,
            orderType,
            durationMinutes: null,
            placeType: null,
            placeRefId: null,
        });
        if (orderType === OrderLocationType.CompanyDelivery) {
            this.currentCompanyDelivery.set(delivery as ICustomerSearchRow);
            this.currentDelivery.set(null);
        } else {
            this.currentDelivery.set(delivery as IDeliverySearchRow);
            this.currentCompanyDelivery.set(null);
        }
        this.DeliveryDialogVisible = false;
        this.messageService.add({ severity: 'success', summary: 'Ù†Ø¬Ø§Ø­', detail: 'ØªÙ… Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø¯Ù„ÙŠÙØ±ÙŠ Ø¨Ù†Ø¬Ø§Ø­' });
    }

    //#endregion

    //
    //#region additions
    //

    additionsDialogVisible: boolean = false;

    orderRecipeAdditionsResponsiveOptions = [
        {
            breakpoint: '1400px',
            numVisible: 3,
            numScroll: 1,
        },
        {
            breakpoint: '1199px',
            numVisible: 3,
            numScroll: 1,
        },
        {
            breakpoint: '767px',
            numVisible: 2,
            numScroll: 1,
        },
        {
            breakpoint: '575px',
            numVisible: 1,
            numScroll: 1,
        },
    ];
    additionsDialogResponsiveOptions = [
        {
            breakpoint: '1400px',
            numVisible: 7,
            numScroll: 1,
        },
        {
            breakpoint: '1199px',
            numVisible: 5,
            numScroll: 1,
        },
        {
            breakpoint: '767px',
            numVisible: 4,
            numScroll: 1,
        },
        {
            breakpoint: '575px',
            numVisible: 2,
            numScroll: 1,
        },
    ];
    productService = inject(ProductService);
    groupService = inject(GroupService);
    currentMenuItemIx = signal<number | null>(null);
    currentMenuItem = computed(() => {
        const currentIndex = this.currentMenuItemIx();
        if (currentIndex == null) return null;
        return this.orderMenuItems()[currentIndex] ?? null;
    });
    currentMenuItemAdditions = computed(() => this.currentMenuItem()?.additions ?? []);
    additionProducts = signal<IProductSearchRow[]>([]);
    additionPaginationInfo: {
        pageIndex: number;
        totalPagesCount: number;
        totalRowsCount: number;
    } = {
        pageIndex: 1,
        totalPagesCount: 0,
        totalRowsCount: 0,
    };

    addAdditionQuantity(addition: IProductSearchRow, quantity: number | null) {
        const currentIndex = this.currentMenuItemIx();
        const currentMenuItem = this.currentMenuItem();
        if (currentIndex == null || !currentMenuItem) return;

        const existingAddition = currentMenuItem.additions.find(
            (existingAddition) => existingAddition.product.id === addition.id,
        );

        const deleteAddition = () =>
            this.orderMenuItems.update((orderItems) =>
                orderItems.map((orderItem, i) =>
                    i == currentIndex
                        ? {
                              ...orderItem,
                              additions: orderItem.additions.filter(
                                  (existingAddition) => existingAddition.product.id != addition.id,
                              ),
                          }
                        : orderItem,
                ),
            );

        if (quantity == null) {
            //delete addition
            deleteAddition();
            return;
        }

        if (existingAddition) {
            const futureQuantity = existingAddition.quantity + quantity;

            if (futureQuantity <= 0) {
                deleteAddition();
                return;
            }

            const nextAdditions = currentMenuItem.additions.map((existingAddition) =>
                existingAddition.product.id === addition.id
                    ? { ...existingAddition, quantity: futureQuantity > 100 ? 100 : futureQuantity }
                    : existingAddition,
            );

            this.orderMenuItems.update((items) =>
                items.map((item, i) => (i == currentIndex ? { ...currentMenuItem, additions: nextAdditions } : item)),
            );
        } else {
            if (quantity <= 0) return;
            this.orderMenuItems.update((orderItems) =>
                orderItems.map((orderItem, i) =>
                    i == currentIndex
                        ? {
                              ...orderItem,
                              additions: orderItem.additions.concat({
                                  product: addition,
                                  quantity: quantity > 100 ? 100 : quantity,
                              }),
                          }
                        : orderItem,
                ),
            );
        }

        // if (existingAddition) {
        //   // this.orderMenuItems.update((orderItems) =>
        //   //   orderItems.map((orderItem, i) =>
        //   //     i == this.currentMenuItemIx()
        //   //       ? {
        //   //           ...orderItem,
        //   //           additions: orderItem.additions.map((addition, j) =>
        //   //             j == additionIx ? { ...addition, quantity } : addition,
        //   //           ),
        //   //         }
        //   //       : orderItem,
        //   //   ),
        //   // );
        // }
    }

    updateAdditionQuantity(addition: IProductSearchRow, quantity: number) {
        const currentIndex = this.currentMenuItemIx();
        const currentMenuItem = this.currentMenuItem();
        if (currentIndex == null || !currentMenuItem) return;
        const existingAddition = currentMenuItem.additions.find(
            (existingAddition) => existingAddition.product.id === addition.id,
        );
        if (existingAddition) {
            this.orderMenuItems.update((items) =>
                items.map((item, i) =>
                    i == currentIndex
                        ? {
                              ...currentMenuItem,
                              additions: currentMenuItem.additions.map((existing) =>
                                  existing.product.id === addition.id ? { ...existing, quantity } : existing,
                              ),
                          }
                        : item,
                ),
            );
        }
    }

    getProductAdditions(product: IProductSearchRow, currentMenuItemIx: number) {
        this.currentMenuItemIx.set(currentMenuItemIx);
        this.productService.getAdditions(product.id).subscribe({
            next: (products) => {
                if (products?.length > 0) {
                    this.additionProducts.set(products);
                    this.currentMenuItemIx.set(currentMenuItemIx);
                    this.additionsDialogVisible = true;
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Ø®Ø·Ø§Ù”', detail: 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø§Ø¶Ø§ÙØ§Øª Ù„Ù„Ù…Ù†ØªØ¬' });
                }
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Ø®Ø·Ø§Ù”', detail: 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø§Ø¶Ø§ÙØ§Øª Ù„Ù„Ù…Ù†ØªØ¬' });
            },
        });
    }

    getOrderItemAdditionQuantity(additionId: number) {
        const orderItem = this.currentMenuItem();
        if (!orderItem) return 0;
        const existingAddition = orderItem.additions.find((addition) => addition.product.id == additionId);
        return existingAddition ? existingAddition.quantity : 0;
    }

    closeAdditionsDialog() {
        this.additionsDialogVisible = false;
        this.additionProducts.set([]);
        this.currentMenuItemIx.set(null);
    }

    //#endregion

    //
    //#region customer info
    //

    orderConfirmationDialogVisible = signal(false);
    customerValidators: { [key: string]: ValidatorFn[] } = {
        id: [Validators.required],
        phoneNumber: [Validators.required, Validators.minLength(6)],
        addressDescription: [Validators.required],
    };

    customerFg = this.orderFg.controls.customerRequest;

    showCustomerDialog() {
        this.orderConfirmationDialogVisible.set(true);
    }
    // onCustomerInfoDialogVisibilityChange(visible: boolean) {
    //     if (!visible) {
    //         this.closeFullKeyboard();
    //     }
    // }

    customersService = inject(CustomerService);

    customers = signal<ICustomerSearchRow[]>([]);
    cashCustomer: ICustomerSearchRow = {
        id: 0,
        name: 'Ø¹Ù…ÙŠÙ„ Ù†Ù‚Ø¯ÙŠ',
        phoneNumber: '',
        secondaryMobileNumber: '',
        city: '',
        district: '',
        street: '',
        buildingNumber: '',
        apartment: '',
        landmark: '',
        postalCode: '',
        commercialRegister: '',
        isCompany: false,
        numberOfFloor: 0,
        orderNumbers: 0,
        taxNumber: 0,
    };
    allowCashCustomer = signal(true);
    displayedCustomers = computed(() => {
        if (this.allowCashCustomer()) {
            return [this.cashCustomer].concat(this.customers());
        }
        return this.customers();
    });
    customersSearchPaginationInfo: IPaginationInfo = {
        pageIndex: 1,
        totalRowsCount: 0,
        totalPagesCount: 0,
    };

    previousCustomersSearchTerm: string = '';
    searchCustomers(data: { pageIndex: number; searchTerm?: string }) {
        this.customersService
            .search({
                paginationInfo: {
                    pageIndex: data.pageIndex,
                    pageSize: 10,
                },
                searchFilters: [
                    {
                        column: CustomerSearchEnum.Name,
                        values: [data.searchTerm ?? ''],
                    },
                ],
                fromDate: null,
            })
            .subscribe({
                next: (res) => {
                    if (res.value.rows.length > 0) {
                        this.previousCustomersSearchTerm = data.searchTerm ?? '';
                        if (data.pageIndex == 1) {
                            this.customers.set(res.value.rows);
                        } else {
                            this.customers.update((prev) => prev.concat(res.value.rows));
                        }
                        this.customersSearchPaginationInfo = {
                            pageIndex: data.pageIndex,
                            totalPagesCount: res.value.paginationInfo.totalPagesCount,
                            totalRowsCount: res.value.paginationInfo.totalRowsCount,
                        };
                    }
                },
            });
    }

    onCustomerSelected(customer: ICustomerSearchRow) {
        this.setSelectedCustomer(customer);
    }

    patchCustomerFg(values?: ICustomerSearchRow) {
        const customer = values ?? this.cashCustomer;
        const address = [customer?.city, customer?.district, customer?.street, customer?.buildingNumber]
            .filter(Boolean)
            .join(', ');

        this.orderFg.controls.customerRequest.patchValue({
            id: customer?.id ?? 0,
            nameAr: customer?.name ?? 'Ø¹Ù…ÙŠÙ„ Ù†Ù‚Ø¯ÙŠ',
            nameEn: customer?.name ?? 'Ø¹Ù…ÙŠÙ„ Ù†Ù‚Ø¯ÙŠ',
            phoneNumber: customer?.phoneNumber ?? '',
            secondaryMobileNumber: customer?.secondaryMobileNumber ?? '',
            addressDescription: address,
        });
    }

    onCustomersNameSearch(event: any, searchTerm: string = '') {
        searchTerm = searchTerm ?? '';
        const isNewSearchTerm = searchTerm != this.previousCustomersSearchTerm;
        console.log('onCustomersNameSearch', searchTerm, isNewSearchTerm);
        if (searchTerm && searchTerm.length > 100) return;
        if (isNewSearchTerm) {
            this.searchCustomers({ pageIndex: 1, searchTerm });
        } else {
            this.searchCustomers({ pageIndex: this.customersSearchPaginationInfo.pageIndex + 1, searchTerm });
        }
    }

    //#endregion

    private preparePaymentConfirmationDialog() {
        this.amountReceived.set(0);
        this.numericPopupVisible.set(false);
        this.enablePaymentTypeForDialog();

        const prefs = this.posPaymentPreferencesService.load();
        if (prefs) {
            this.applyPaymentPreferences(prefs);
        } else {
            this.printService.selectedPrinters.set([]);
        }

        this.applyPaymentAmountDefaults(prefs);
    }

    private enablePaymentTypeForDialog() {
        if (this.orderTypeControl.value === OrderLocationType.CompanyDelivery) {
            this.paymentTypeControl.setValue(OrderPaymentType.Pending, { emitEvent: true });
            this.paymentTypeControl.disable({ emitEvent: false });
            return;
        }

        this.paymentTypeControl.enable({ emitEvent: false });
    }

    private applyPaymentPreferences(prefs: IPosPaymentPreferences) {
        const orderType = this.orderTypeControl.value;

        if (orderType !== OrderLocationType.CompanyDelivery) {
            this.paymentTypeControl.setValue(prefs.paymentType, { emitEvent: true });
        }

        this.orderFg.patchValue(
            {
                cashAccountId: prefs.cashAccountId ?? this.orderFg.controls.cashAccountId.value,
                networkAccountId: prefs.networkAccountId ?? this.orderFg.controls.networkAccountId.value,
            },
            { emitEvent: false },
        );

        this.restorePrinterSelections(prefs);
    }

    private applyPaymentAmountDefaults(_prefs: IPosPaymentPreferences | null = null) {
        const paymentType = this.paymentTypeControl.value;

        if (paymentType !== OrderPaymentType.Paid) {
            this.orderFg.patchValue(
                {
                    payingCash: 0,
                    payingNetwork: 0,
                },
                { emitEvent: false },
            );
            return;
        }

        this.applyDefaultPaymentAmounts();
    }

    private applyDefaultPaymentAmounts() {
        const total = +this.initialNet().toFixed(2);
        this.orderFg.patchValue(
            {
                payingCash: total,
                payingNetwork: 0,
            },
            { emitEvent: false },
        );
    }

    transferAllToNetwork() {
        const total = +this.initialNet().toFixed(2);
        this.orderFg.patchValue(
            {
                payingCash: 0,
                payingNetwork: total,
            },
            { emitEvent: false },
        );
    }

    transferAllToCash() {
        const total = +this.initialNet().toFixed(2);
        this.orderFg.patchValue(
            {
                payingCash: total,
                payingNetwork: 0,
            },
            { emitEvent: false },
        );
    }

    private detectPaymentSplit(cash: number | null, network: number | null): PosPaymentSplit {
        const cashAmount = +(cash ?? 0);
        const networkAmount = +(network ?? 0);

        if (cashAmount > 0 && networkAmount === 0) {
            return 'cash';
        }
        if (networkAmount > 0 && cashAmount === 0) {
            return 'network';
        }
        return 'mixed';
    }

    selectPaymentType(type: OrderPaymentType) {
        if (this.paymentTypeControl.disabled) {
            return;
        }

        this.paymentTypeControl.setValue(type, { emitEvent: true });

        if (type === OrderPaymentType.Paid) {
            this.applyDefaultPaymentAmounts();
        } else {
            this.orderFg.patchValue(
                {
                    payingCash: 0,
                    payingNetwork: 0,
                },
                { emitEvent: false },
            );
            this.amountReceived.set(0);
        }
    }

    private restorePrinterSelections(prefs: IPosPaymentPreferences) {
        const settings = this.printerSettingsService.printerSettings();
        if (!settings) {
            this.printService.selectedPrinters.set([]);
            return;
        }

        const restored: IAppPrinter[] = [];

        if (prefs.cashierPrinter && settings.cashierPrinter?.id === prefs.cashierPrinter.id) {
            restored.push({ ...settings.cashierPrinter, appPrinterType: AppPrinterType.cashierPrinter });
        }
        if (prefs.captainPrinter && settings.captionOrderPrinter?.id === prefs.captainPrinter.id) {
            restored.push({ ...settings.captionOrderPrinter, appPrinterType: AppPrinterType.captionOrderPrinter });
        }
        if (prefs.kitchenPrinter && settings.programPrinter?.id === prefs.kitchenPrinter.id) {
            restored.push({ ...settings.programPrinter, appPrinterType: AppPrinterType.programPrinter });
        }

        this.printService.selectedPrinters.set(restored);
    }

    private savePaymentPreferencesFromForm() {
        const raw = this.orderFg.getRawValue();
        const selected = this.printService.selectedPrinters();

        const toPref = (type: AppPrinterType) => {
            const printer = selected.find((p) => p.appPrinterType === type);
            return printer ? { id: printer.id, appPrinterType: type } : null;
        };

        this.posPaymentPreferencesService.save({
            paymentType: raw.paymentType ?? OrderPaymentType.Paid,
            lastPaymentSplit: this.detectPaymentSplit(raw.payingCash, raw.payingNetwork),
            cashAccountId: raw.cashAccountId,
            networkAccountId: raw.networkAccountId,
            cashierPrinter: toPref(AppPrinterType.cashierPrinter),
            captainPrinter: toPref(AppPrinterType.captionOrderPrinter),
            kitchenPrinter: toPref(AppPrinterType.programPrinter),
        });
    }

    private syncPaymentTypeControlWithOrderType() {
        const orderType = this.orderTypeControl.value;

        switch (orderType) {
            case OrderLocationType.Takeaway:
                this.paymentTypeControl.setValue(OrderPaymentType.Paid, { emitEvent: false });
                this.paymentTypeControl.disable({ emitEvent: false });
                break;
            case OrderLocationType.CompanyDelivery:
                this.paymentTypeControl.setValue(OrderPaymentType.Pending, { emitEvent: false });
                this.paymentTypeControl.disable({ emitEvent: false });
                break;
            default:
                this.paymentTypeControl.enable({ emitEvent: false });
                break;
        }
    }

    closeOrderConfirmationDialog() {
        this.orderConfirmationDialogVisible.set(false);
        this.syncPaymentTypeControlWithOrderType();
    }

    onPaymentConfirmationDialogHide() {
        this.syncPaymentTypeControlWithOrderType();
    }

    //
    //#region payment info
    //

    paymentDialogVisible = false;

    showPaymentDialog() {
        this.paymentDialogVisible = true;
    }

    getPaymentInvalidControl() {
        const cashControl = this.orderFg.get('payingCash');
        const networkControl = this.orderFg.get('payingNetwork');
        if (cashControl?.invalid) {
            return cashControl;
        } else if (networkControl?.invalid && networkControl?.touched) {
            return networkControl;
        }
        return null;
    }

    // Amount received from customer (for change calculation only)
    amountReceived = signal<number>(0);

    numericPopupVisible = signal(false);

    // Change returned to customer when received exceeds invoice total
    customerChangeAmount = computed(() => {
        if (this.paymentTypeSignal() !== OrderPaymentType.Paid) {
            return 0;
        }

        const received = this.amountReceived() ?? 0;
        const invoiceTotal = this.initialNet();
        if (received <= invoiceTotal) {
            return 0;
        }

        return +(received - invoiceTotal).toFixed(2);
    });

    openReceivedAmountPopup() {
        if (this.paymentTypeSignal() !== OrderPaymentType.Paid) {
            return;
        }

        this.numericPopupVisible.set(true);
    }

    onNumericPopupConfirm(value: number) {
        this.amountReceived.set(Math.max(0, +value.toFixed(2)));
        this.numericPopupVisible.set(false);
    }

    setFullReceivedAmount() {
        this.amountReceived.set(+this.initialNet().toFixed(2));
    }

    orderPaymentTypeChangeListener = this.orderFg.controls.paymentType.valueChanges.subscribe((value) => {
        const validators: ValidatorFn[] = value === OrderPaymentType.Paid ? [Validators.required] : [];

        const controls = [this.payingCashControl, this.payingNetworkControl];

        controls.forEach((control) => {
            if (value === OrderPaymentType.Paid) {
                control?.enable({ emitEvent: false });
            } else {
                control?.disable({ emitEvent: false });
            }

            control?.setValidators(validators);
            control?.updateValueAndValidity({ emitEvent: false });
        });
    });

    cashInputSubscription = this.payingCashControl.valueChanges.subscribe((value) => {
        if (this.paymentTypeControl.value !== OrderPaymentType.Paid) {
            return;
        }

        const net = this.initialNet();
        let futureValue = +(value ?? 0);

        if (futureValue > net) futureValue = net;
        else if (futureValue < 0) futureValue = 0;

        this.orderFg.patchValue(
            {
                payingNetwork: +Math.max(0, net - futureValue).toFixed(2),
            },
            { emitEvent: false },
        );
    });

    networkInputSubscription = this.payingNetworkControl?.valueChanges.subscribe((value) => {
        if (this.paymentTypeControl.value !== OrderPaymentType.Paid) {
            return;
        }

        const net = this.initialNet();
        let futureValue = +(value ?? 0);

        if (futureValue > net) futureValue = net;
        else if (futureValue < 0) futureValue = 0;

        this.orderFg.patchValue(
            {
                payingCash: +Math.max(0, net - futureValue).toFixed(2),
            },
            { emitEvent: false },
        );
    });

    //#endregion
}
/*
<!-- Hut -->
<p-dialog
    [(visible)]="HutDialogVisible"
    [modal]="true"
    [dismissableMask]="true"
    [style]="{ width: '80%', maxWidth: '50rem' }"
    [attr.style]="'--p-mask-background:#375652e5!important;'"
    styleClass="bg-text-lighter!"
    class="addition-dialog"
    [contentStyleClass]="`flex flex-col ${isLoading() && 'opacity-50 cursor-wait'}`"
>
    <p class="font-bold text-center text-dark-bg-2 text-lg">Ø¥Ø®ØªØ± Ø§Ù„ÙƒÙˆØ®</p>

    <div
        class="flex-1 overflow-auto no-scrollbar"
        appDebounce
        #hutsScroller
        [domEvents]="['scroll']"
        (debounced)="onHutsScroll($event, hutsScroller)"
    >
        <div
            class="h-fit grid mt-10 items-center justify-center grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-[90px_20px]"
        >
            @for (item of huts(); track $index) {
                <app-hut-card
                    [active]="item.id == currentHut()?.id"
                    [data]="item"
                    (click)="onHutSelected(item)"
                    class="max-w-full!"
                />
            }
        </div>
    </div>

    <div class="grid grid-cols-3 gap-4 border-t border-dark-line pt-4 [&_label]:mb-1 [&_label]:inline-block">
        <!-- reservation time -->
        <div>
            <label for="">Ù…Ø¯Ø© Ø§Ù„Ø­Ø¬Ø²</label>
            <p-select
                style="--p-select-background: #ffffff"
                class="w-full border border-dark-line!"
                [options]="[30, 60, 90, 120, 150, 180]"
                [ngModel]="currentHutMinutes()"
                (onChange)="onHutDurationChange($event)"
            />
        </div>
        <!-- hut name/id -->
        <div>
            <label for="">Ø±Ù‚Ù… / Ø§Ø³Ù… Ø§Ù„ÙƒÙˆØ®</label>
            <input
                type="text"
                name=""
                class="w-full border border-dark-line!"
                disabled
                [value]="currentHut()?.name"
                pInputText
                id=""
            />
        </div>
        <!-- hut price -->
        <div>
            <label for="">Ø³Ø¹Ø± Ø§Ù„ÙƒÙˆØ® ÙÙŠ Ø§Ù„Ø³Ø§Ø¹Ù‡</label>
            <input
                type="text"
                name=""
                class="w-full border border-dark-line!"
                disabled
                [value]="currentHutPrice().toFixed(2)"
                pInputText
                id=""
            />
        </div>
    </div>

    <ng-template #footer>
        <div class="flex justify-center items-center gap-2 w-full *:px-8! *:py-0.75! *:text-sm! *:font-bold">
            <button pButton severity="secondary" class="bg-dark-bg-2" (click)="submitHut()">
                {{ 'ACTIONS.CONTINUE' | translate }}
            </button>
            <button pButton severity="secondary" (click)="HutDialogVisible = false">
                {{ 'ACTIONS.CANCEL' | translate }}
            </button>
        </div>
    </ng-template>
</p-dialog>

<!-- Room -->
<p-dialog
    [(visible)]="RoomDialogVisible"
    [modal]="true"
    [dismissableMask]="true"
    [style]="{ width: '80%', maxWidth: '50rem' }"
    [attr.style]="'--p-mask-background:#375652e5!important;'"
    styleClass="bg-text-lighter!"
    class="addition-dialog"
    [contentStyleClass]="`flex flex-col ${isLoading() && 'opacity-50 cursor-wait'}`"
>
    <p class="font-bold text-center text-dark-bg-2 text-lg">Ø¥Ø®ØªØ± Ø§Ù„ØºØ±ÙØ©</p>

    <div
        class="flex-1 overflow-auto no-scrollbar"
        appDebounce
        #roomsScroller
        [domEvents]="['scroll']"
        (debounced)="onRoomsScroll($event, roomsScroller)"
    >
        <div class="h-fit grid mt-10 items-center justify-center grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-5">
            @for (item of rooms(); track $index) {
                <app-room-card
                    [active]="item.id == currentRoom()?.id"
                    [data]="item"
                    (click)="onRoomSelected(item)"
                    class="max-w-full"
                />
            }
        </div>
    </div>

    <ng-template #footer>
        <button pButton styleClass="app-p-btn" class="mx-auto" severity="secondary" (click)="RoomDialogVisible = false">
            Ø§Ø³ØªÙ…Ø±Ø§Ø±
        </button>
    </ng-template>
</p-dialog>

<!-- Table -->
<p-dialog
    [(visible)]="TableDialogVisible"
    [modal]="true"
    [dismissableMask]="true"
    [style]="{ width: '80%', maxWidth: '50rem' }"
    [attr.style]="'--p-mask-background:#375652e5!important;'"
    styleClass="bg-text-lighter!"
    class="addition-dialog"
    [contentStyleClass]="`flex flex-col ${isLoading() && 'opacity-50 cursor-wait'}`"
>
    <p class="font-bold text-center text-dark-bg-2 text-lg">Ø¥Ø®ØªØ± Ø§Ù„Ø·Ø§ÙˆÙ„Ø©</p>
    <div
        class="flex-1 overflow-auto no-scrollbar"
        appDebounce
        #tablesScroller
        [domEvents]="['scroll']"
        (debounced)="onTablesScroll($event, tablesScroller)"
    >
        <div class="h-fit grid mt-10 items-center justify-center grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-5">
            @for (item of tables(); track $index) {
                <app-table-card
                    [active]="item.id == currentTable()?.id"
                    [data]="item"
                    (click)="onTableSelected(item)"
                    class="max-w-full"
                />
            }
        </div>
    </div>

    <ng-template #footer>
        <button
            pButton
            styleClass="app-p-btn"
            class="mx-auto"
            severity="secondary"
            (click)="TableDialogVisible = false"
        >
            Ø§Ø³ØªÙ…Ø±Ø§Ø±
        </button>
    </ng-template>
</p-dialog>
*/
