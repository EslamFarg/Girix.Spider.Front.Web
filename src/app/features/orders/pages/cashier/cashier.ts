import {
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    input,
    OnInit,
    signal,
    untracked,
    viewChild,
} from '@angular/core';
import { IMenuItem, IOrderMenuItem, Menu } from '../../components/menu/menu';
import { OrderSuccessDialog } from '../../components/order-success-dialog/order-success-dialog';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { ImgFallback } from '@/directives/img-fallback';
import { Button, ButtonDirective } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { ProductsAndMealsService, ProductAndMealsSearchEnum, IOrderBillReadResponse } from '@/features/orders';
import { SkeletonModule } from 'primeng/skeleton';
import {
    FormArray,
    FormControl,
    Validators,
    ɵInternalFormsSharedModule,
    ReactiveFormsModule,
    ValidatorFn,
    FormsModule,
    FormGroup,
} from '@angular/forms';
import { IProductSearchRow, ProductSearchEnum, ProductService } from '@/features/classes/services/product-service';
import { IMealSearchRow } from '@/features/classes/services/meal-service';
import { GroupService, IGroupSearchRow, IGroupSearchResponseValue } from '@/features/classes/services/group-service';
import { AllowNumbers } from '@/directives/allow-numbers';
import { GalleriaModule } from 'primeng/galleria';
import { Slider, HutCard, RoomCard, TableCard, BaseComponent, FormMode, IPaginationInfo } from '@/components';
import {
    IOrderCreateCustomer,
    IOrderCreateItem,
    IOrderCreateRequest,
    OrderPaymentType,
    OrderLocalType,
    OrderService,
    OrderLocationType,
    IOrderReadResponse,
    IOrderCreateItemAddon,
} from '@/features/orders/index';
import { DatePipe } from '@angular/common';
import { HutSearchEnum, HutService, IHutSearchRow } from '@/features/restaurant/services/hut-service';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { ITableSearchRow, TableSearchEnum, TableService } from '@/features/restaurant/services/table-service';
import { IRoomSearchRow, RoomSearchEnum, RoomService } from '@/features/restaurant/services/room-service';
import { Carousel } from 'primeng/carousel';
import { OrderCalculationsService } from '../../services/order-calculations-service';
import { TranslatePipe } from '@ngx-translate/core';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { ICustomerSearchRow } from '@/features/customers/services/customer-types';
import { CustomerSearchEnum, CustomerService } from '@/features/customers/services/customer-service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { PrinterService, IPrintOrderOption, AppPrinterType } from '@/features/printers';
import { PrinterSettingsService } from '@/features/printers/services/printer-settings-service';
import { PrintableOrderInvoice } from '@/features/orders/components/printable-order-invoice/printable-order-invoice';
import {
    FinancialSettingsService,
    IFinancialSettingsResponse,
} from '@/features/settings/services/financial-settings-service';
import { labeledRequiredValidator, noSymbolsAllowed, onlyNumbersOrDotAllowed } from '@/yn-ng/utils/text-validators';
import { Select, SelectChangeEvent } from 'primeng/select';
import { KeyboardService } from '@/features/keyboard/services/keyboard-service';
import { FullKeyboard } from '@/features/keyboard/components/full-keyboard/full-keyboard';
import { NumbersKeyboard } from '@/features/keyboard/components/numbers-keyboard/numbers-keyboard';
import { AmountType } from '@/core/enums';
import { FormControlNotifier } from '@/directives/form-control-notifier';
import {
    DeliverySearchEnum,
    DeliveryService,
    IDeliverySearchRow,
} from '@/features/deliveries/services/delivery-service';
import { RouterLink } from '@angular/router';
import {
    FinancialAccountSearchEnum,
    FinancialAccountService,
} from '@/features/accounts/services/financial-account-service';
import { IFinancialAccountSearchRow, ITreeFinancialAccountSearchRow } from '@/features/accounts/types';
import { AllowedRolesDirective } from '@/directives/allowed-roles';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { DecimalMask } from '@/directives/decimal-mask';
import { ChosenLocalPlace, LocalPlaceSelect } from '@/components/local-place-select/local-place-select';
import { DialogType } from '@/features/dialogs/enums';
import { ControlsOf, NullablePropsOf } from '@/yn-ng/types/helpers';

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
    customerRequest: FormControl<FormGroup<ControlsOf<NullablePropsOf<IOrderCreateCustomer>>> | null>;
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
        HutCard,
        RoomCard,
        TableCard,
        DatePipe,
        Debounce,
        Carousel,
        GalleriaModule,
        Slider,
        DatePipe,
        TranslatePipe,
        InputErrorMessageHandler,
        Button,
        ButtonDirective,
        NgSelectComponent,
        Select,
        FormsModule,
        FullKeyboard,
        NumbersKeyboard,
        FormControlNotifier,
        SkeletonModule,
        RouterLink,
        PrintableOrderInvoice,
        AllowedRolesDirective,
        LoadingDisabledDirective,
        InputGroupAddon,
        DecimalMask,
    ],
    templateUrl: './cashier.html',
    styleUrl: './cashier.css',
})
export class Cashier extends BaseComponent implements OnInit {
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
    lastCreatedOrder = signal<any | null>(null);
    successDialogVisible = signal(false);

    // Print dialog
    printService = inject(PrinterService);
    printerSettingsService = inject(PrinterSettingsService);
    printDialogVisible = false;
    printBill = signal<IOrderBillReadResponse | null>(null);
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
        paymentType: this.fb.control<OrderPaymentType>(OrderPaymentType.Pending, [Validators.required]),
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
            [Validators.minLength(1), labeledRequiredValidator('يجب اختيار صنف', 'you must select an item')],
        ),
        customerRequest: this.fb.control(null),
    };

    registerValidators() {
        const { orderType, paymentType, payingCash, payingNetwork, createAt, idempotencyKey, items } =
            this.orderFg.controls;
        items.setValidators([
            Validators.minLength(1),
            labeledRequiredValidator('يجب اختيار صنف', 'you must select an item'),
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

    /**
     *
     */
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
        this.searchCustomers({ pageIndex: 1, searchTerm: '' });

        this.orderFg.get('orderType')?.valueChanges.subscribe((orderType) => {
            const { placeRefId, deliveryId, paymentType } = this.orderFg.controls;

            this.orderLocationType.set(orderType);

            switch (orderType) {
                case OrderLocationType.Takeaway:
                    this.isPaid.set(true);
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
                    console.log('changed to takeaway and removed placeRefId validators');
                    break;

                // 1. Shared logic runs first for all three types
                case OrderLocationType.PersonDelivery:
                case OrderLocationType.CompanyDelivery:
                case OrderLocationType.DineIn:
                    paymentType.enable();
                    // No break here! Execution falls through to the next matching case.
                    console.log('orderType', orderType);
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
                                labeledRequiredValidator('يرجى اختيار الدليفري', 'you must select a delivery'),
                            ]);

                            switch (orderType) {
                                case OrderLocationType.PersonDelivery:
                                    this.currentCompanyDelivery.set(null);
                                    break;
                                case OrderLocationType.CompanyDelivery:
                                    this.currentDelivery.set(null);
                                    break;
                            }

                            break;

                        case OrderLocationType.DineIn:
                            this.orderFg?.patchValue({
                                placeType: OrderLocalType.Table,
                                deliveryId: null,
                                durationMinutes: null,
                            });
                            deliveryId?.clearValidators();
                            placeRefId!.setValidators([
                                labeledRequiredValidator('يرجى اختيار المكان', 'you must select a place'),
                            ]);
                            break;
                    }
                    break; // Breaks out of the main switch
            }

            Object.values(this.orderFg.controls).forEach((control) => {
                control.updateValueAndValidity({ emitEvent: false });
            });
        });

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

    onSubmitOrder() {
        this.orderFg.patchValue({
            items: this.orderCreateItems(),
        });
        console.log(this.orderFg.value);
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

        const values = this.orderFg.getRawValue();

        switch (values.orderType) {
            case OrderLocationType.CompanyDelivery:
                const currentCompany = this.currentCompanyDelivery();
                this.orderFg.patchValue({
                    deliveryId: null,
                    customerRequest: {
                        nameAr: currentCompany?.name || '',
                        phoneNumber: currentCompany?.phoneNumber || '',
                        addressDescription: currentCompany?.city || currentCompany?.district || '',
                        id: currentCompany?.id!,
                        nameEn: currentCompany?.name || '',
                        secondaryMobileNumber: currentCompany?.secondaryMobileNumber || '',
                    },
                });
        }

        console.log('valid order');
        switch (this.formMode()) {
            case FormMode.Create:
                if (this.orderFg.value.orderType == OrderLocationType.DineIn) {
                    if (!this.orderFg.value.placeRefId) {
                        this.messageService.add({ severity: 'error', summary: 'فشل', detail: 'لم يتم اختيار المكان' });
                        return;
                    }
                }
                this.orderService.create({ ...this.orderFg.value, createAt: this.localDateIso }).subscribe({
                    next: (res) => {
                        this.lastCreatedOrder.set(res);
                        this.printBill.set(res as unknown as IOrderBillReadResponse);
                        this.resetOrderForm();
                        this.successDialogVisible.set(true);
                    },
                    error: (err) => {
                        console.log(err);
                        this.messageService.add({ severity: 'error', summary: 'فشل', detail: 'لم يتم انشاء الطلب' });
                        this.resetIdempotencyKey();
                    },
                });
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
                            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم تعديل الطلب' });
                            this.resetOrderForm();
                            this.router.navigate(['/']);
                        },
                        error: (err) => {
                            console.log(err);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'فشل',
                                detail: 'لم يتم تعديل الطلب',
                            });
                            this.resetIdempotencyKey();
                        },
                    });
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
        this.currentCustomer.set(null);
        this.chosenLocalPlace.set(null);
        this.currentDelivery.set(null);
        this.currentCompanyDelivery.set(null);
        this.amountReceived.set(0);
        this.orderFg.patchValue({
            placeRefId: null,
            placeType: null,
            deliveryId: null,
        });
        this.resetIdempotencyKey();
        this.orderFg.updateValueAndValidity();
        this.resetData();
    }

    onSuccessDialogHide() {
        this.successDialogVisible.set(false);
        this.lastCreatedOrder.set(null);
        this.resetOrderForm();
    }

    onSuccessDialogPrint() {
        this.successDialogVisible.set(false);
        this.lastCreatedOrder.set(null);
        // Open the 3-options printer selection dialog
        this.printOrder();
    }

    //#endregion

    //
    //#region Print
    //

    openPrintDialog() {
        this.printDialogVisible = true;
    }

    onPrintDialogHide() {
        this.printDialogVisible = false;
        this.printBill.set(null);
    }

    /**
     * Groups items and their modifiers by printer id.
     */
    private groupItemsByPrinter(
        bill: IOrderBillReadResponse,
    ): Map<number, { printer: IOrderBillReadResponse['items'][0]['printer']; items: IOrderBillReadResponse['items'] }> {
        const groups = new Map<
            number,
            { printer: IOrderBillReadResponse['items'][0]['printer']; items: IOrderBillReadResponse['items'] }
        >();

        for (const item of bill.items) {
            const itemPrinterId = item.printer?.id;
            if (itemPrinterId != null) {
                if (!groups.has(itemPrinterId)) {
                    groups.set(itemPrinterId, { printer: item.printer, items: [] });
                }
                groups.get(itemPrinterId)!.items.push(item);
            }

            for (const modifier of item.modifiers ?? []) {
                const modPrinterId = modifier.printer?.id;
                if (modPrinterId != null) {
                    if (!groups.has(modPrinterId)) {
                        groups.set(modPrinterId, {
                            printer: {
                                id: modifier.printer.id,
                                name: modifier.printer.name,
                                ipAddressOrMacAddress: modifier.printer.ipAddressOrMacAddress,
                                port: modifier.printer.port,
                                type: modifier.printer.type,
                            },
                            items: [],
                        });
                    }
                    groups.get(modPrinterId)!.items.push({
                        ...item,
                        name: `+ ${modifier.name}`,
                        qty: modifier.qty,
                        unitPrice: modifier.unitPrice,
                        modifiers: [],
                    });
                }
            }
        }

        return groups;
    }

    /**
     * Generates a simplified kitchen/captain receipt HTML (no prices, just items + qty).
     */
    private generateSimplifiedReceiptHtml(
        bill: IOrderBillReadResponse,
        items: IOrderBillReadResponse['items'],
        title: string,
    ): string {
        const itemRows = items
            .map((item) => {
                let rows = `
      <tr>
        <td style="padding:4px 0;text-align:right;border-bottom:1px dashed #ccc;">${item.name}</td>
        <td style="padding:4px 0;text-align:center;border-bottom:1px dashed #ccc;">${item.qty}</td>
      </tr>`;
                for (const modifier of item.modifiers ?? []) {
                    rows += `
      <tr>
        <td style="padding:4px 16px 4px 4px;text-align:right;border-bottom:1px dashed #eee;color:#555;font-size:13px;">+ ${modifier.name}</td>
        <td style="padding:4px 0;text-align:center;border-bottom:1px dashed #eee;color:#555;font-size:13px;">${modifier.qty}</td>
      </tr>`;
                }
                return rows;
            })
            .join('');

        const totalQty = items.reduce((sum, item) => {
            let qty = item.qty;
            for (const modifier of item.modifiers ?? []) {
                qty += modifier.qty;
            }
            return sum + qty;
        }, 0);

        return `
<div style="direction:rtl;padding:8px;font-family:'Cairo',sans-serif;font-size:16px;max-width:300px;">
  <div style="text-align:center;margin-bottom:8px;font-weight:bold;font-size:16px;">
    ${title}
  </div>
  <div style="margin-bottom:8px;text-align:center;font-size:12px;">
    <div>رقم الفاتورة ${bill.invoiceNo}</div>
    <div>${new DatePipe('en-US').transform(bill.dateTime, 'dd/MM/yyyy h:mm a')}</div>
    <div>نوع الطلب: ${bill.orderType === 1 ? 'سفري' : bill.orderType === 2 ? 'محلي' : 'توصيل'}</div>
  </div>
  <table style="width:100%;border-collapse:collapse;">
    <thead>
      <tr style="border-bottom:2px solid #000;">
        <th style="padding:4px;text-align:right;">الصنف</th>
        <th style="padding:4px;text-align:center;">الكمية</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
      <tr style="border-top:2px solid #000;">
        <td style="padding:4px;text-align:right;font-weight:bold;">المجموع</td>
        <td style="padding:4px;text-align:center;font-weight:bold;">${totalQty.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>
  <div style="text-align:center;margin-top:8px;font-size:12px;">
    رقم الطلب ${bill.orderNo}
  </div>
</div>`;
    }

    /**
     * Generates a full cashier-style receipt HTML for a group of items.
     */
    private generateCashierReceiptHtml(bill: IOrderBillReadResponse, items: IOrderBillReadResponse['items']): string {
        const itemRows = items
            .map((item) => {
                let rows = `
      <tr>
        <td style="padding:4px;text-align:right;">${item.name}</td>
        <td style="padding:4px;text-align:center;">${item.qty}</td>
        <td style="padding:4px;text-align:left;">${item.unitPriceWithTax?.toFixed(2)}</td>
      </tr>`;
                for (const modifier of item.modifiers ?? []) {
                    rows += `
      <tr>
        <td style="padding:4px 16px 4px 4px;text-align:right;color:#555;font-size:12px;">+ ${modifier.name}</td>
        <td style="padding:4px;text-align:center;color:#555;font-size:12px;">${modifier.qty}</td>
        <td style="padding:4px;text-align:left;color:#555;font-size:12px;">${modifier.unitPriceWithTax?.toFixed(2)}</td>
      </tr>`;
                }
                return rows;
            })
            .join('');

        const totalUnitPrice = items.reduce((sum, item) => {
            let itemTotal = (item.unitPriceWithTax ?? 0) * item.qty;
            for (const modifier of item.modifiers ?? []) {
                itemTotal += (modifier.unitPriceWithTax ?? 0) * modifier.qty;
            }
            return sum + itemTotal;
        }, 0);

        return `
<div style="direction:rtl;padding:8px;font-family:'Cairo',sans-serif;font-size:14px;max-width:300px;">
  <div style="text-align:center;margin-bottom:8px;font-weight:bold;font-size:16px;">
    فاتورة كاشير
  </div>
  <div style="margin-bottom:8px;font-size:12px;text-align:center;">
    <div><strong>رقم الفاتورة:</strong> ${bill.invoiceNo}</div>
    <div><strong>رقم الطلب:</strong> ${bill.orderNo}</div>
    <div><strong>التاريخ:</strong> ${new DatePipe('en-US').transform(bill.dateTime, 'dd/MM/yyyy h:mm a')}</div>
    <div><strong>العميل:</strong> ${bill.customer?.name ?? ''}</div>
    <div><strong>رقم الجوال:</strong> ${bill.customer?.phone ?? ''}</div>
    <div><strong>نوع الدفع:</strong> ${bill.paymentType ? 'مدفوع' : 'غير مدفوع'}</div>
  </div>
  <table style="width:100%;border-collapse:collapse;">
    <thead>
      <tr style="border-bottom:2px solid #000;">
        <th style="padding:4px;text-align:right;">الصنف</th>
        <th style="padding:4px;text-align:center;">الكمية</th>
        <th style="padding:4px;text-align:left;">السعر</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
      <tr style="border-top:2px solid #000;">
        <td style="padding:4px;text-align:right;font-weight:bold;">المجموع</td>
        <td></td>
        <td style="padding:4px;text-align:left;font-weight:bold;">${totalUnitPrice.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>
</div>`;
    }

    printOrder() {
        const bill = this.printBill();
        if (!bill) return;

        this.printerSettingsService.getSettings().subscribe({
            next: (settings) => {
                const options: IPrintOrderOption[] = [];
                const baseCss = `
          body { font-family: 'Cairo', sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { padding: 4px; }
        `;

                // Kitchen (programPrinter): group items by their item-level printer id
                if (settings.programPrinter?.id) {
                    const kitchenGroups = this.groupItemsByPrinter(bill);
                    for (const [, group] of kitchenGroups) {
                        options.push({
                            printer: {
                                id: group.printer.id,
                                name: group.printer.name,
                                ipAddressOrMacAddress: group.printer.ipAddressOrMacAddress,
                                port: group.printer.port,
                                type: group.printer.type,
                                comPort: (group.printer as any).comPort ?? 0,
                                appPrinterType: AppPrinterType.programPrinter,
                            },
                            html: this.generateSimplifiedReceiptHtml(bill, group.items, 'فاتورة المطبخ'),
                            css: baseCss,
                        });
                    }
                }

                // Captain (captionOrderPrinter): full receipt, simplified format
                if (settings.captionOrderPrinter?.id) {
                    options.push({
                        printer: {
                            id: settings.captionOrderPrinter.id,
                            name: settings.captionOrderPrinter.name,
                            ipAddressOrMacAddress: settings.captionOrderPrinter.ipAddressOrMacAddress,
                            port: settings.captionOrderPrinter.port,
                            type: settings.captionOrderPrinter.type,
                            comPort: settings.captionOrderPrinter.comPort ?? 0,
                            appPrinterType: AppPrinterType.captionOrderPrinter,
                        },
                        html: this.generateSimplifiedReceiptHtml(bill, bill.items, 'أمر كابتن'),
                        css: baseCss,
                    });
                }

                // Cashier (cashierPrinter): full receipt, full format with prices
                if (settings.cashierPrinter?.id) {
                    options.push({
                        printer: {
                            id: settings.cashierPrinter.id,
                            name: settings.cashierPrinter.name,
                            ipAddressOrMacAddress: settings.cashierPrinter.ipAddressOrMacAddress,
                            port: settings.cashierPrinter.port,
                            type: settings.cashierPrinter.type,
                            comPort: settings.cashierPrinter.comPort ?? 0,
                            appPrinterType: AppPrinterType.cashierPrinter,
                        },
                        html: this.generateCashierReceiptHtml(bill, bill.items),
                        css: baseCss,
                    });
                }

                if (options.length === 0) {
                    this.printService.openPrinterDialog({
                        css: this.printableOrderInvoice()?.styles ?? '',
                        html: this.printableOrderInvoice()?.html()?.nativeElement.outerHTML ?? '',
                    });
                    return;
                }

                this.printService.openPrinterDialogWithJobs(options);
            },
            error: () => {
                this.printService.openPrinterDialog({
                    css: this.printableOrderInvoice()?.styles ?? '',
                    html: this.printableOrderInvoice()?.html()?.nativeElement.outerHTML ?? '',
                });
            },
        });
    }

    onPrint() {
        const bill = this.existingOrderBill();
        if (!bill) return;
        this.printBill.set(bill);
        this.openPrintDialog();
    }

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

    netPreview = computed(
        () =>
            this.orderItemsNet() + this.hutNet() + this.serviceFee() + this.deliveryFee() - this.itemsDiscountAmount(),
    );

    net = computed(() => {
        const net =
            this.orderItemsNet() + this.hutNet() + this.serviceFee() + this.deliveryFee() - this.itemsDiscountAmount();

        return this.isPaid() ? net : 0;
    });

    netListener = effect(() => {
        let net = this.net();

        this.orderFg.patchValue({
            payingCash: net,
            payingNetwork: 0,
        });
    });

    //#endregion

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

    //
    //#region keyboard
    //

    keyboardService = inject(KeyboardService);
    closeFullKeyboard = this.keyboardService.closeFullKeyboard;
    toggleNumbersKeyboard = () => {
        if (this.keyboardService.isNumbersKeyboardVisible()) {
            this.closeNumbersKeyboard();
        } else {
            this.keyboardService.openNumbersKeyboard();
        }
    };
    triggerFullKeyboard(inputClassSelector: string) {
        this.keyboardService.triggerFullKeyboard(inputClassSelector, 'full-keyboard');
    }
    closeNumbersKeyboard = this.keyboardService.closeNumbersKeyboard;

    triggerNumbersKeyboard(input: HTMLInputElement) {
        this.keyboardService.triggerNumbersKeyboard(input);
    }

    // Local numbers keyboard visibility for payment dialog
    isPaymentNumbersKeyboardVisible = signal(false);
    togglePaymentNumbersKeyboard() {
        this.isPaymentNumbersKeyboardVisible.update((v) => !v);
    }

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
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم اختيار الدليفري بنجاح' });
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
    currentMenuItemIx = signal(0);
    currentMenuItemAdditions = computed(() => this.orderMenuItems()[this.currentMenuItemIx()].additions);
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
    // searchAdditions(pageIndex: number) {
    //   this.productService
    //     .getAdditions({
    //       dto: {
    //         paginationInfo: {
    //           pageIndex: pageIndex,
    //           pageSize: 20,
    //         },
    //       },
    //       isAddition: true,
    //     })
    //     .subscribe({
    //       next: (res) => {
    //         if (res.rows.length > 0) {
    //           this.additionProducts.update((prev) => prev.concat(res.rows));
    //           this.additionPaginationInfo = {
    //             pageIndex,
    //             totalPagesCount: res.paginationInfo.totalPagesCount,
    //             totalRowsCount: res.paginationInfo.totalRowsCount,
    //           };
    //         }
    //       },
    //     });
    // }
    // onAdditionsScroll(event: Event) {
    //   const menuContainer = event.target as HTMLElement;

    //   // if at bottom
    //   if (menuContainer.scrollTop + menuContainer.clientHeight >= menuContainer.scrollHeight - 1) {
    //     this.searchAdditions(this.additionPaginationInfo.pageIndex + 1);
    //   }
    // }

    // addAddition(item: IProductSearchRow, quantity: number) {
    //   const futureQuantity =
    //     this.orderMenuItems()[this.currentMenuItemIx()].additions.find((addition) => addition.product.id === item.id)!
    //       .quantity + quantity;

    //   this.updateAdditionQuantity(item, futureQuantity);
    // }

    // removeAddition(item: IProductSearchRow, quantity: number) {
    //   this.updateAdditionQuantity(item, futureQuantity > 1000 ? 1000 : futureQuantity);
    // }

    addAdditionQuantity(addition: IProductSearchRow, quantity: number | null) {
        const currentMenuItem = this.orderMenuItems()[this.currentMenuItemIx()];

        const existingAddition = currentMenuItem.additions.find(
            (existingAddition) => existingAddition.product.id === addition.id,
        );

        const deleteAddition = () =>
            this.orderMenuItems.update((orderItems) =>
                orderItems.map((orderItem, i) =>
                    i == this.currentMenuItemIx()
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
            //adding quantity
            const futureQuantity = existingAddition.quantity + quantity;

            if (futureQuantity <= 0) {
                deleteAddition();
                return;
            }

            currentMenuItem.additions.forEach((existingAddition) => {
                if (existingAddition.product.id === addition.id) {
                    existingAddition.quantity = futureQuantity > 1000 ? 1000 : futureQuantity;
                }
            });

            this.orderMenuItems.update((items) =>
                items.map((item, i) => (i == this.currentMenuItemIx() ? currentMenuItem : item)),
            );
        } else {
            if (quantity <= 0) return;
            //add new
            this.orderMenuItems.update((orderItems) =>
                orderItems.map((orderItem, i) =>
                    i == this.currentMenuItemIx()
                        ? {
                              ...orderItem,
                              additions: orderItem.additions.concat({
                                  product: addition,
                                  quantity: quantity > 1000 ? 1000 : quantity,
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

    getProductAdditions(product: IProductSearchRow, currentMenuItemIx: number) {
        this.productService.getAdditions(product.id).subscribe({
            next: (products) => {
                if (products?.length > 0) {
                    this.additionProducts.set(products);
                    this.currentMenuItemIx.set(currentMenuItemIx);
                    this.additionsDialogVisible = true;
                } else {
                    this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'لا يوجد اضافات للمنتج' });
                }
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'لا يوجد اضافات للمنتج' });
            },
        });
    }

    //#endregion

    //
    //#region customer info
    //

    customerDialogVisible = false;
    currentCustomer = signal<{
        id: number;
        nameAr: string;
        nameEn: string;
        phoneNumber: string;
        secondaryMobileNumber: string;
        addressDescription: string;
    } | null>(null);
    // currentCustomerChangeEffect = effect(() => {
    //     if (this.currentCustomer()) {
    //         this.customerFg.patchValue({
    //             id: this.currentCustomer()?.id,
    //             phoneNumber: this.currentCustomer()?.phoneNumber,
    //             addressDescription: this.currentCustomer()?.addressDescription,
    //         });
    //     } else {
    //         this.customerFg.patchValue({
    //             id: this.cashCustomer.id,
    //             phoneNumber: this.cashCustomer.phoneNumber + '',
    //             addressDescription: 'عميل نقدي',
    //         });
    //     }
    //     this.orderFg.patchValue({
    //         customerRequest: this.currentCustomer(),
    //     });
    // });
    showCustomerDialog() {
        this.customerDialogVisible = true;
    }
    onCustomerInfoDialogVisibilityChange(visible: boolean) {
        if (!visible) {
            this.closeFullKeyboard();
        }
    }
    customerFgInitialValue = {
        id: this.fb.control<number | null>(0, []),
        phoneNumber: this.fb.control<string | null>(null, [Validators.required]),
        addressDescription: this.fb.control<string | null>(null, [Validators.required]),
    };

    customerFg = this.fb.group(this.customerFgInitialValue);

    customersService = inject(CustomerService);

    customers = signal<ICustomerSearchRow[]>([]);
    cashCustomer = {
        id: 0,
        name: 'عميل نقدي',
        phoneNumber: 0,
    };
    displayedCustomers = computed(() => [this.cashCustomer, ...this.customers()]);
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
    onCustomerSelected(event: ICustomerSearchRow) {
        const fg = this.orderFg;
        if (event.id) {
            if (fg.value.customerRequest) {
                this.currentCustomer.set({
                    id: event.id,
                    nameAr: event.name,
                    nameEn: event.name,
                    phoneNumber: event.phoneNumber,
                    secondaryMobileNumber: event.secondaryMobileNumber,
                    addressDescription:
                        event.city + ', ' + event.district + ', ' + event.street + ', ' + event.buildingNumber,
                });
            } else {
                this.orderFg.setControl("customerRequest", this.createCustomerFg(event));
            }
        } else {
            this.currentCustomer.set(null);
        }
    }
    createCustomerFg(values?: ICustomerSearchRow) {
        const address = [values?.city, values?.district, values?.street, values?.buildingNumber]
            .filter(Boolean)
            .join(', ');

        return this.fb.group<ControlsOf<NullablePropsOf<IOrderCreateCustomer>>>({
            id: this.fb.control<number | null>(values?.id ?? null, []),
            nameAr: this.fb.control<string | null>(values?.name ?? null, [Validators.required]),
            nameEn: this.fb.control<string | null>(values?.name ?? null, []),
            phoneNumber: this.fb.control<string | null>(values?.phoneNumber ?? null, [Validators.required]),
            secondaryMobileNumber: this.fb.control<string | null>(values?.secondaryMobileNumber ?? null),
            addressDescription: this.fb.control<string | null>(address, [Validators.required]),
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

    isPaid = signal<boolean>(false);

    // Amount received from customer (for change calculation only)
    amountReceived = signal<number>(0);

    // Calculate change (positive = return to customer, negative = still required)
    changeAmount = computed(() => {
        const received = this.amountReceived() ?? 0;
        const total = this.net() ?? 0;
        return received - total;
    });

    isPaidListener = effect(() => {
        let validators: ValidatorFn[] = [];
        const cashControl = this.orderFg.get('payingCash');
        const networkControl = this.orderFg.get('payingNetwork');
        this.orderFg.patchValue({
            payingCash: 0,
            payingNetwork: 0,
        });
        if (this.isPaid()) {
            validators = [Validators.required];
            cashControl?.enable();
            networkControl?.enable();
            this.orderFg.patchValue({
                paymentType: OrderPaymentType.Paid,
            });
        } else {
            cashControl?.disable();
            networkControl?.disable();
            this.orderFg.patchValue({
                paymentType: OrderPaymentType.Pending,
            });
        }
        cashControl?.setValidators(validators);
        networkControl?.setValidators(validators);
    });

    cashInputSubscription = this.orderFg.get('payingCash')?.valueChanges.subscribe((value) => {
        const net = this.net();
        let futureValue = value ?? 0;
        if (futureValue > net) {
            futureValue = net;
        } else if (futureValue < 0) {
            futureValue = 0;
        }
        this.orderFg.patchValue(
            {
                payingNetwork: net - futureValue,
                payingCash: futureValue,
            },
            { emitEvent: false },
        );
    });

    networkInputSubscription = this.orderFg.get('payingNetwork')?.valueChanges.subscribe((value) => {
        const net = this.net();
        let futureValue = value ?? 0;
        if (futureValue > net) {
            futureValue = net;
        } else if (futureValue < 0) {
            futureValue = 0;
        }
        this.orderFg.patchValue(
            {
                payingCash: net - futureValue,
                payingNetwork: futureValue,
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
    [attr.style]="'--p-mask-background:#1f1d2be5!important;'"
    styleClass="bg-text-lighter!"
    class="addition-dialog"
    [contentStyleClass]="`flex flex-col ${isLoading() && 'opacity-50 cursor-wait'}`"
>
    <p class="font-bold text-center text-dark-bg-2 text-lg">إختر الكوخ</p>

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
            <label for="">مدة الحجز</label>
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
            <label for="">رقم / اسم الكوخ</label>
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
            <label for="">سعر الكوخ في الساعه</label>
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
    [attr.style]="'--p-mask-background:#1f1d2be5!important;'"
    styleClass="bg-text-lighter!"
    class="addition-dialog"
    [contentStyleClass]="`flex flex-col ${isLoading() && 'opacity-50 cursor-wait'}`"
>
    <p class="font-bold text-center text-dark-bg-2 text-lg">إختر الغرفة</p>

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
            استمرار
        </button>
    </ng-template>
</p-dialog>

<!-- Table -->
<p-dialog
    [(visible)]="TableDialogVisible"
    [modal]="true"
    [dismissableMask]="true"
    [style]="{ width: '80%', maxWidth: '50rem' }"
    [attr.style]="'--p-mask-background:#1f1d2be5!important;'"
    styleClass="bg-text-lighter!"
    class="addition-dialog"
    [contentStyleClass]="`flex flex-col ${isLoading() && 'opacity-50 cursor-wait'}`"
>
    <p class="font-bold text-center text-dark-bg-2 text-lg">إختر الطاولة</p>
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
            استمرار
        </button>
    </ng-template>
</p-dialog>
*/
