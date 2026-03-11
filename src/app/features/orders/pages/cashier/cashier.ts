import { Component, computed, effect, inject, input, OnInit, signal, untracked } from '@angular/core';
import { IMenuItem, IOrderMenuItem, Menu } from '../../components/menu/menu';
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
import { Debounce } from '@/directives/debounce';
import { ITableSearchRow, TableSearchEnum, TableService } from '@/features/restaurant/services/table-service';
import { IRoomSearchRow, RoomSearchEnum, RoomService } from '@/features/restaurant/services/room-service';
import { Carousel } from 'primeng/carousel';
import { OrderCalculationsService } from '../../services/order-calculations-service';
import { TranslatePipe } from '@ngx-translate/core';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { ICustomerSearchRow } from '@/features/customers/services/customer-types';
import { CustomerSearchEnum, CustomerService } from '@/features/customers/services/customer-service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { PrinterService } from '@/features/printers';
import {
  FinancialSettingsService,
  IFinancialSettingsResponse,
} from '@/features/settings/services/financial-settings-service';
import { labeledRequiredValidator, noSymbolsAllowed } from '@/yn-ng/utils/text-validators';
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
import { ITreeFinancialAccountSearchRow } from '@/features/accounts/services/financial-account-types';

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
  customerRequest: FormControl<IOrderCreateCustomer | null>;
  placeName: FormControl<string | null>;
  cashAccountId: FormControl<number | null>;
  networkAccountId: FormControl<number | null>;
}

@Component({
  selector: 'app-home',
  imports: [
    Menu,
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
    payingCash: this.fb.control<number | null>(null, [Validators.required]),
    payingNetwork: this.fb.control<number | null>(null, [Validators.required]),
    createAt: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
    idempotencyKey: this.fb.control<string>(Date.now() + Math.random().toString(), [Validators.required]),
    cashAccountId: this.fb.control<number | null>(null, [Validators.required]),
    networkAccountId: this.fb.control<number | null>(null, [Validators.required]),
    items: this.fb.control<IOrderCreateItem[]>(
      [],
      [Validators.minLength(1), labeledRequiredValidator('يجب اختيار صنف', 'you must select an item')],
    ),
    customerRequest: this.fb.control<IOrderCreateCustomer | null>(null, []),
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

    this.searchHuts(1);
    this.searchRooms(1);
    this.searchTables(1);
    this.searchDeliveries(1);
    this.searchAccounts({
      pageIndex: 1,
      searchTerm: '',
    }).subscribe({
      next: (res) => {
        this.cashAccounts.set(res.value.rows);
        this.networkAccounts.set(res.value.rows);
      }
    })
    // this.searchAdditions(1);
    this.searchCustomers({ pageIndex: 1, searchTerm: '' });

    this.orderFg.get('orderType')?.valueChanges.subscribe((orderType) => {
      const placeRefId = this.orderFg.get('placeRefId');
      const deliveryId = this.orderFg.get('deliveryId');
      this.orderLocationType.set(orderType);
      placeRefId?.setValidators([]);
      deliveryId?.setValidators([]);
      this.orderFg?.patchValue({
        placeRefId: null,
        deliveryId: null,
      });
      switch (orderType) {
        case OrderLocationType.Takeaway:
          this.isPaid.set(true);
          break;
        case OrderLocationType.Delivery:
          deliveryId?.setValidators([labeledRequiredValidator('يرجى اختيار الدليفري', 'you must select a delivery')]);
          break;
        case OrderLocationType.DineIn:
          this.orderFg.patchValue({ placeType: OrderLocalType.Table });
          placeRefId!.setValidators([labeledRequiredValidator('يرجى اختيار المكان', 'you must select a place')]);

          break;
      }
      placeRefId?.updateValueAndValidity();
      deliveryId?.updateValueAndValidity();
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
  //
  //
  //
  //
  //
  // menu items change
  //

  onMenuItemChange(changedItem: IOrderMenuItem) {
    if (changedItem.menuItem.quantity <= 0) return;

    this.orderMenuItems.update((items) => items.concat(changedItem));
    // return;
    // const existingItem = this.orderMenuItems().find((item) => item.menuItem.id == changedItem.menuItem.id);
    // if (existingItem) {
    //   const futureQuantity = existingItem.menuItem.quantity + changedItem.menuItem.quantity;

    //   if (futureQuantity >= 1000) {
    //     this.orderMenuItems.update((items) =>
    //       items.map((item) =>
    //         item.menuItem.id == existingItem.menuItem.id
    //           ? { ...item, menuItem: { ...item.menuItem, quantity: 1000 } }
    //           : item,
    //       ),
    //     );
    //     return;
    //   }

    //   if (futureQuantity <= 0) {
    //     this.orderMenuItems.update((items) => items.filter((item) => item.menuItem.id != changedItem.menuItem.id));
    //     return;
    //   }

    //   this.orderMenuItems.update((items) =>
    //     items.map((item) =>
    //       item.menuItem.id == existingItem.menuItem.id
    //         ? { ...item, menuItem: { ...item.menuItem, quantity: futureQuantity } }
    //         : item,
    //     ),
    //   );
    // } else {
    // }
  }
  test() {
    window.electronAPI.getPrinters().then((e) => console.log(e));
  }

  onOrderMenuItemQuantityChange(index: number, newQuantity: number) {
    if (newQuantity >= 1000) {
      this.orderMenuItems.update((items) =>
        items.map((item, i) => (i == index ? { ...item, menuItem: { ...item.menuItem, quantity: 1000 } } : item)),
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
  // order form
  //

  onSubmitOrder() {
    this.orderFg.patchValue({
      items: this.orderCreateItems(),
    });
    console.log(this.orderFg.value);
    if (this.orderFg.invalid) {
      console.log('invalid order');
      this.orderFg.markAllAsTouched();
      return;
    }

    console.log('valid order');
    switch (this.formMode()) {
      case FormMode.Create:
        this.orderService.create(this.orderFg.value).subscribe({
          next: (res) => {},
          error: (err) => {
            console.log(err);
            this.messageService.add({ severity: 'error', summary: 'فشل', detail: 'لم يتم انشاء الطلب' });
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
              this.router.navigate(['/']);
            },
            error: (err) => {
              console.log(err);
              this.messageService.add({ severity: 'error', summary: 'فشل', detail: 'لم يتم تعديل الطلب' });
            },
          });
        break;
    }
  }

  resetOrderForm() {
    this.orderMenuItems.set([]);
    this.currentCustomer.set(null);
    this.orderFg.patchValue({
      idempotencyKey: Date.now() + Math.random().toString(),
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
  //general calculations
  //

  orderLocationType = signal<OrderLocationType | null>(OrderLocationType.Takeaway);

  deliveryFee = computed(() => {
    if (this.orderLocationType() !== OrderLocationType.Delivery) return 0;

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
    if (this.orderLocationType() !== OrderLocationType.DineIn) return 0;

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
    return serviceFeeAfterTax;
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

  net = computed(() => {
    const net =
      this.orderItemsNet() + this.hutNet() + this.serviceFee() + this.deliveryFee() - this.itemsDiscountAmount();

    return net;
  });

  netListener = effect(() => {
    let net = this.net();

    this.orderFg.patchValue({
      payingCash: net,
      payingNetwork: 0,
    });
  });

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
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //print
  //

  printService = inject(PrinterService);

  onPrint() {
    // this.printService.printOrder();
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
  //keyboard
  //

  keyboardService = inject(KeyboardService);
  closeFullKeyboard = this.keyboardService.closeFullKeyboard;
  openNumbersKeyboard = () => {
    this.keyboardService.openNumbersKeyboard();
    this.changeDetectionRef.markForCheck();
  };
  triggerFullKeyboard(inputClassSelector: string) {
    this.keyboardService.triggerFullKeyboard(inputClassSelector, 'full-keyboard');
  }
  closeNumbersKeyboard = this.keyboardService.closeNumbersKeyboard;

  triggerNumbersKeyboard(input: HTMLInputElement) {
    this.keyboardService.triggerNumbersKeyboard(input);
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
  //Accounts
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

  displayedCashAccounts = computed(() => [this.currentCashAccount(), ...this.customers()]);
  displayedNetworkAccounts = computed(() => [this.currentNetworkAccount(), ...this.customers()]);
  


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
  // onAccountSelected(event: ITreeFinancialAccountSearchRow, isCash: boolean) {
  //   if (!event.id) return;

  //   if (isCash) {
  //     this.currentCashAccount.set({
  //       id: event.id,
  //       name: event.name,
  //     });
  //   } else {
  //     this.currentNetworkAccount.set({
  //       id: event.id,
  //       name: event.name,
  //     });
  //   }
  // }
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

  onFinancialAccountsSearch(event: any, searchTerm: string = '', isCash: boolean) {
    searchTerm = searchTerm ?? '';
    if (searchTerm && searchTerm.length > 100) return;
    if (isCash) {
      const isNewSearchTerm = searchTerm != this.previousCashAccountsSearchTerm;
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
        this.searchAccounts({ pageIndex: this.customersSearchPaginationInfo.pageIndex + 1, searchTerm }).subscribe({
          next: (res) => {
            if (res.value.rows.length > 0) {
              this.previousCashAccountsSearchTerm = searchTerm;
              this.cashAccounts.set(res.value.rows);
              this.cashAccountsSearchPaginationInfo = {
                pageIndex: this.customersSearchPaginationInfo.pageIndex + 1,
                totalPagesCount: res.value.paginationInfo.totalPagesCount,
                totalRowsCount: res.value.paginationInfo.totalRowsCount,
              };
            }
          },
        });
      }
    } else {
      const isNewSearchTerm = searchTerm != this.previousNetworkAccountsSearchTerm;
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
        this.searchAccounts({ pageIndex: this.networkAccountsSearchPaginationInfo.pageIndex + 1, searchTerm }).subscribe({
          next: (res) => {
            if (res.value.rows.length > 0) {
              this.previousNetworkAccountsSearchTerm = searchTerm;
              this.networkAccounts.set(res.value.rows);
              this.networkAccountsSearchPaginationInfo = {
                pageIndex: this.customersSearchPaginationInfo.pageIndex + 1,
                totalPagesCount: res.value.paginationInfo.totalPagesCount,
                totalRowsCount: res.value.paginationInfo.totalRowsCount,
              };
            }
          },
        });
      }
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
  //local space
  //

  //huts
  HutDialogVisible: boolean = false;

  hutService = inject(HutService);
  huts = signal<IHutSearchRow[]>([]);
  currentHut = signal<IHutSearchRow | null>(null);
  currentHutMinutes = signal(30);
  currentHutPrice = computed(() => {
    const currentHut = this.currentHut();
    if (!currentHut) return 0;

    const hutHourPriceAfterVat = currentHut.pricePerHour * (1 + this.financialSettings().vat / 100);

    return hutHourPriceAfterVat;
  });
  hutNet = computed(() => {
    const hutPricePerHour = this.currentHut()?.pricePerHour ?? 0;
    const vat = this.financialSettings().vat;
    const minutes = this.currentHutMinutes();
    const price = hutPricePerHour * (minutes / 60);

    if (this.orderFg.value.placeType == OrderLocalType.Hut && this.currentHut()) {
      return price * (1 + vat / 100);
    } else {
      return 0;
    }
  });
  hutPaginationInfo: {
    pageIndex: number;
    totalPagesCount: number;
    totalRowsCount: number;
  } = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

  searchHuts(pageIndex: number) {
    this.hutService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 20,
        },
        searchFilters: [
          {
            column: HutSearchEnum.Name,
            values: [''],
          },
        ],
        fromDate: null,
      })
      .subscribe({
        next: (res) => {
          if (res.value.rows.length > 0) {
            this.huts.update((prev) => prev.concat(res.value.rows));
            this.hutPaginationInfo = {
              pageIndex,
              totalPagesCount: res.value.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.paginationInfo.totalRowsCount,
            };
          }
        },
      });
  }

  onHutsScroll(event: Event, hutsScroller: HTMLElement) {
    // if at bottom
    if (hutsScroller.scrollTop + hutsScroller.clientHeight >= hutsScroller.scrollHeight - 1) {
      this.searchHuts(this.hutPaginationInfo.pageIndex + 1);
    }
  }

  onHutSelected(hut: IHutSearchRow) {
    if (hut.isAvailable) {
      // this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم اختيار الموقع' });
      this.currentHut.set(hut);
      // this.HutDialogVisible = false;
    }
  }

  submitHut() {
    const hut = this.currentHut();
    if (!hut) {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'لم يتم اختيار كوخ' });
      return;
    }
    this.orderFg.patchValue({
      placeRefId: hut.id,
      placeType: OrderLocalType.Hut,
      durationMinutes: this.currentHutMinutes(),
    });
    this.HutDialogVisible = false;
    this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم اختيار الموقع بنجاح' });
  }

  onHutDurationChange(duration: SelectChangeEvent) {
    this.currentHutMinutes.set(duration.value);
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
  //tables
  //
  TableDialogVisible: boolean = false;

  tableService = inject(TableService);
  tables = signal<ITableSearchRow[]>([]);

  tablePaginationInfo: {
    pageIndex: number;
    totalPagesCount: number;
    totalRowsCount: number;
  } = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };
  searchTables(pageIndex: number) {
    this.tableService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 20,
        },
        searchFilters: [
          {
            column: TableSearchEnum.Name,
            values: [''],
          },
        ],
        fromDate: null,
      })
      .subscribe({
        next: (res) => {
          if (res.value.rows.length > 0) {
            this.tables.update((prev) => prev.concat(res.value.rows));
            this.tablePaginationInfo = {
              pageIndex,
              totalPagesCount: res.value.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.paginationInfo.totalRowsCount,
            };
          }
        },
      });
  }
  onTablesScroll(event: Event, tablesScroller: HTMLElement) {
    // if at bottom
    if (tablesScroller.scrollTop + tablesScroller.clientHeight >= tablesScroller.scrollHeight - 1) {
      this.searchTables(this.tablePaginationInfo.pageIndex + 1);
    }
  }
  onTableSelected(table: ITableSearchRow) {
    if (table.isAvailable) {
      this.orderFg.patchValue({ placeRefId: table.id, placeType: OrderLocalType.Table });
      this.TableDialogVisible = false;
      this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم اختيار الموقع' });
    } else {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'الموقع مشغول' });
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
  //rooms
  //
  RoomDialogVisible: boolean = false;

  roomService = inject(RoomService);
  rooms = signal<IRoomSearchRow[]>([]);
  roomPaginationInfo: {
    pageIndex: number;
    totalPagesCount: number;
    totalRowsCount: number;
  } = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };
  searchRooms(pageIndex: number) {
    this.roomService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 20,
        },
        searchFilters: [
          {
            column: RoomSearchEnum.Name,
            values: [''],
          },
        ],
        fromDate: null,
      })
      .subscribe({
        next: (res) => {
          if (res.value.rows.length > 0) {
            this.rooms.update((prev) => prev.concat(res.value.rows));
            this.roomPaginationInfo = {
              pageIndex,
              totalPagesCount: res.value.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.paginationInfo.totalRowsCount,
            };
          }
        },
      });
  }
  onRoomsScroll(event: Event, roomsScroller: HTMLElement) {
    // console.log(roomsScroller);
    // if at bottom
    if (roomsScroller.scrollTop + roomsScroller.clientHeight >= roomsScroller.scrollHeight - 1) {
      this.searchRooms(this.roomPaginationInfo.pageIndex + 1);
    }
  }
  onRoomSelected(room: IRoomSearchRow) {
    if (room.isAvailable) {
      this.orderFg.patchValue({ placeRefId: room.id, placeType: OrderLocalType.Room });
      this.RoomDialogVisible = false;
      this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم اختيار الموقع بنجاح' });
    } else {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'الموقع مشغول' });
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
  // deliveries
  //

  DeliveryDialogVisible: boolean = false;

  deliveryService = inject(DeliveryService);
  deliveries = signal<IDeliverySearchRow[]>([]);
  companyDeliveries = signal<ICustomerSearchRow[]>([]);

  isCompanyDelivery: boolean = false;

  changeDeliveryType(isCompany: boolean) {
    this.isCompanyDelivery = isCompany;
    this.orderFg.patchValue({
      orderType: OrderLocationType.Delivery,
      deliveryId: null,
    });
    this.searchDeliveries(1, isCompany);
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
            pageSize: 20,
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
            pageSize: 20,
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
  onDeliverySelected(deliveryId: number) {
    // if (delivery.isAvailable) {
    this.orderFg.patchValue({ deliveryId });
    this.DeliveryDialogVisible = false;
    this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم اختيار الدليفري بنجاح' });
    // } else {
    //   this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'الموقع مشغول' });
    // }
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
  //additions
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
                additions: orderItem.additions.filter((existingAddition) => existingAddition.product.id != addition.id),
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
  //customer info
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
  currentCustomerChangeEffect = effect(() => {
    if (this.currentCustomer()) {
      this.customerFg.patchValue({
        id: this.currentCustomer()?.id,
        phoneNumber: this.currentCustomer()?.phoneNumber,
        addressDescription: this.currentCustomer()?.addressDescription,
      });
    } else {
      this.customerFg.patchValue({
        id: this.cashCustomer.id,
        phoneNumber: this.cashCustomer.phoneNumber + '',
        addressDescription: 'عميل نقدي',
      });
    }
    this.orderFg.patchValue({
      customerRequest: this.currentCustomer(),
    });
  });
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
    phoneNumber: this.fb.control<string | null>(null, []),
    addressDescription: this.fb.control<string | null>(null, []),
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
    if (event.id) {
      this.currentCustomer.set({
        id: event.id,
        nameAr: event.name,
        nameEn: event.name,
        phoneNumber: event.phoneNumber,
        secondaryMobileNumber: event.secondaryMobileNumber,
        addressDescription: event.city + ', ' + event.district + ', ' + event.street + ', ' + event.buildingNumber,
      });
    } else {
      this.currentCustomer.set(null);
    }
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
  //payment info
  //

  paymentDialogVisible = false;

  showPaymentDialog() {
    this.paymentDialogVisible = true;
  }

  getPaymentInvalidControl() {
    const cashControl = this.orderFg.get('payingCash');
    const networkControl = this.orderFg.get('payingNetwork');
    if (cashControl?.invalid && cashControl?.touched) {
      return cashControl;
    } else if (networkControl?.invalid && networkControl?.touched) {
      return networkControl;
    }
    return null;
  }

  isPaid = signal<boolean>(true);

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
    } else {
      cashControl?.disable();
      networkControl?.disable();
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
}
