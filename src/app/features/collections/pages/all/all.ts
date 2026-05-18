import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select, SelectChangeEvent } from 'primeng/select';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { Button, ButtonDirective } from 'primeng/button';
import { CollectionsService } from '../../services/collections-service';
import {
  OrderSearchEnum,
  OrderService,
  IOrderSearchRow,
  OrderLocationType,
  OrderLocalType,
  IOrderChangeTypeRequest,
} from '@/features/orders';
import { MenuItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { CustomerSearchEnum, CustomerService } from '@/features/customers/services/customer-service';
import { ICustomerSearchRow } from '@/features/customers/services/customer-types';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { TranslatePipe } from '@ngx-translate/core';
import { AllowNumbers } from '@/directives/allow-numbers';
import {
  FinancialAccountSearchEnum,
  FinancialAccountService,
} from '@/features/accounts/services/financial-account-service';
import { ITreeFinancialAccountSearchRow } from '@/features/accounts/types';
import { labeledRequiredValidator, noSymbolsAllowed, onlyNumbersAllowed } from '@/yn-ng';
import { HutSearchEnum, HutService, IHutSearchRow } from '@/features/restaurant/services/hut-service';
import {
  FinancialSettingsService,
  IFinancialSettingsResponse,
} from '@/features/settings/services/financial-settings-service';
import { ITableSearchRow, TableSearchEnum, TableService } from '@/features/restaurant/services/table-service';
import { IRoomSearchRow, RoomSearchEnum, RoomService } from '@/features/restaurant/services/room-service';
import {
  DeliverySearchEnum,
  DeliveryService,
  IDeliverySearchRow,
} from '@/features/deliveries/services/delivery-service';
import { HutCard, RoomCard, TableCard } from '@/components';
import { Skeleton } from 'primeng/skeleton';
import { AmountType } from '@/core';
import { tap } from 'rxjs';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-all',
  imports: [
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    Select,
    Paginator,
    ReactiveFormsModule,
    InputText,
    Dialog,
    Button,
    DatePipe,
    NgSelectComponent,
    Debounce,
    TranslatePipe,
    AllowNumbers,
    HutCard,
    FormsModule,
    RoomCard,
    TableCard,
    Skeleton,
    ButtonDirective,
    FormsModule,
    Message,
  ],
  templateUrl: './all.html',
  styleUrl: './all.css',
})
export class All extends BaseComponent {
  OrderLocationType = OrderLocationType;
  OrderLocalType = OrderLocalType;

  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<OrderSearchEnum>(OrderSearchEnum.CustomerName, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };

  fg = this.fb.group(this.initialSearchFormValue);

  financialSettingsService = inject(FinancialSettingsService);
  orderService = inject(OrderService);

  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'اسم العميل',
      command: (event) => this.fg.patchValue({ searchEnum: OrderSearchEnum.CustomerName }),
    },
    {
      label: 'رقم الطلب',
      command: (event) => this.fg.patchValue({ searchEnum: OrderSearchEnum.OrderNumber }),
    },
    {
      label: 'موقع الطلب',
      command: (event) => this.fg.patchValue({ searchEnum: OrderSearchEnum.OrderPlace }),
    },
    {
      label: 'نوع الطلب',
      command: (event) => this.fg.patchValue({ searchEnum: OrderSearchEnum.OrderType }),
    },
  ]);

  constructor() {
    super();
    this.financialSettingsService.getSettings().subscribe((res) => this.financialSettings.set(res));
    this.searchOrders(1);
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
      },
    });
    // this.searchAdditions(1);
    this.searchCustomers({ pageIndex: 1, searchTerm: '' });

    this.transferanceFg.get('orderType')?.valueChanges.subscribe((orderType) => {
      const placeRefId = this.transferanceFg.get('placeRefId');
      const deliveryId = this.transferanceFg.get('deliveryId');
      placeRefId?.setValidators([]);
      deliveryId?.setValidators([]);
      this.transferanceFg?.patchValue({
        placeRefId: null,
        deliveryId: null,
      });
      switch (orderType) {
        case OrderLocationType.Takeaway:
          this.isPaid.set(true);
          break;
        case OrderLocationType.PersonDelivery:
        case OrderLocationType.CompanyDelivery:
          //todo: fix delivery Id
          deliveryId?.setValidators([labeledRequiredValidator('يرجى اختيار الدليفري', 'you must select a delivery')]);
          break;
        case OrderLocationType.DineIn:
          this.transferanceFg.patchValue({ placeType: OrderLocalType.Table });
          placeRefId!.setValidators([labeledRequiredValidator('يرجى اختيار المكان', 'you must select a place')]);

          break;
      }
      placeRefId?.updateValueAndValidity();
      deliveryId?.updateValueAndValidity();
    });
    effect(() => {
      const collectedIds = this.collectionsService.collectedOrderIds();
      if (collectedIds.length > 0) {
        this.orders.update((rows) =>
          rows.map((o) => (collectedIds.includes(o.id) ? { ...o, isCollected: true } : o)),
        );
      }
    });
  }

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousLocalDateIso(1) },
    { label: 'اخر اسبوع', value: this.getPreviousLocalDateIso(7) },
    { label: 'اخر شهر', value: this.getPreviousLocalDateIso(30) },
    { label: 'اخر سنة', value: this.getPreviousLocalDateIso(365) },
  ];

  orders = signal<IOrderSearchRow[]>([]);
  ordersPaginationInfo = signal<IPaginationInfo>({
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  });

  searchOrders(pageIndex: number) {
    this.orderService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 10,
        },
        searchFilters: [
          {
            column: this.fg.getRawValue().searchEnum,
            values: [this.fg.getRawValue().searchTerm],
          },
        ],
        fromDate: this.fg.getRawValue().fromDate,
      })
      .subscribe({
        next: (res) => {
          this.orders.set(res.value.rows);
          this.ordersPaginationInfo.set({
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          });
        },
      });
  }

  onSubmit = () => this.fg.valid && this.searchOrders(1);

  onPageChange = (event: PaginatorState) => this.searchOrders(event.page! + 1);

  deleteOrder(order: IOrderSearchRow, event: Event) {
    if (order.isCollected) {
      this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لا يمكن حذف الطلب المحصل' });
      return;
    }

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف الطلب؟',
      header: 'حذف الطلب',
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

      accept: () => this.orderService.delete(order.id).subscribe({ next: () => this.searchOrders(1) }),
      reject: () => this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' }),
    });
  }

  //

  //
  // collection
  //
  collectionsService = inject(CollectionsService);

  openCollectionDialog = this.collectionsService.openCollectionDialog;

  //
  //////////////////////////////////////////////////////////////////////////////////////////////////
  //
  //#region transferance
  //

  currentOrder = signal<IOrderSearchRow | null>(null);
  currentOrderNet = computed(() => this.currentOrder()?.netOrder || 0);
  currentOrderLocationType = computed(() => this.currentOrder()?.orderType);
  orderTransferenceType = signal<OrderLocationType | null>(null);
  toBePaidToClient = signal(0);

  transferenceCost = computed(() => {
    const serviceFee = this.serviceFee();
    const deliveryFee = this.deliveryFee();
    const hutNet = this.hutNet();
    const sum = serviceFee + deliveryFee + hutNet; //this.toBePaidFromClient();
    return sum;
  });

  // transferenceCostEffect = effect(() => {
  //   this.transferanceFg.patchValue({
  //     payingCash: this.transferenceCost(),
  //   });
  // });

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

  allOrderTypes = signal([
    { labelKey: 'محلي', value: OrderLocationType.DineIn },
    { labelKey: 'توصيل (عامل)', value: OrderLocationType.PersonDelivery },
    { labelKey: 'توصيل (شركة)', value: OrderLocationType.CompanyDelivery },
    { labelKey: 'سفري', value: OrderLocationType.Takeaway },
  ]);
  currentOrderType = computed(() => this.allOrderTypes().find((opt) => opt.value === this.currentOrderLocationType()));
  orderTypeOptions = computed(() => this.allOrderTypes().filter((opt) => opt.value !== this.currentOrderType()?.value));
  orderLocalTypeOptions = computed(() =>
    [
      { labelKey: 'كوخ', value: OrderLocalType.Hut },
      { labelKey: 'طاولة', value: OrderLocalType.Table },
      { labelKey: 'غرفة', value: OrderLocalType.Room },
    ].filter((opt) => opt.value !== this.currentOrder()?.placeType),
  );

  isInvoiceTypeChangeDialogVisible = false;
  isInvoiceTypeChangeConfirmDialogVisible = false;

  openInvoiceTypeChangeDialog(order: IOrderSearchRow) {
    if (order.netReturnOrder > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'الغاء',
        detail: 'لا يمكن تغيير نوع الفاتورة للطلبات المرتجعة',
      });
      return;
    }
    this.currentOrder.set(order);
    this.isInvoiceTypeChangeDialogVisible = true;
    this.transferanceFg.patchValue({
      id: order.id,
      orderType: null,
      placeType: null,
      placeRefId: null,
      placeName: '',
      reservedAt: this.localDateIso,
      simulateOnly: true,
      customerRequest: {
        id: order.customerId,
        nameAr: order.customerName,
        nameEn: order.customerName,
        phoneNumber: order.customerPhone,
        secondaryMobileNumber: null,
        addressDescription: order.customerAdress,
      },
    });
  }

  closeInvoiceTypeChangeDialog() {
    this.currentOrder.set(null);
    this.toBePaidToClient.set(0);
    this.isInvoiceTypeChangeDialogVisible = false;
    this.orderTransferenceType.set(null);
    this.isConfirmTransference = false;
  }

  openInvoiceTypeChangeConfirmDialog() {
    this.isInvoiceTypeChangeDialogVisible = true;
  }

  closeInvoiceTypeChangeConfirmDialog() {
    this.isInvoiceTypeChangeConfirmDialogVisible = false;
  }

  phoneNumberValidators = [Validators.required, onlyNumbersAllowed, Validators.minLength(6), Validators.maxLength(16)];

  transferanceFg = this.fb.group({
    id: this.fb.control<null | number>(null, [Validators.required]),
    simulateOnly: this.fb.control<boolean>(true, []),
    // dinein/delivery/takeaway
    orderType: this.fb.control<null | OrderLocationType>(null, [Validators.required]),
    // hut/cabin/room
    placeType: this.fb.control<null | OrderLocalType>(null, [Validators.required]),
    // hut/cabin/room id
    placeRefId: this.fb.control<null | number>(null, [Validators.required]),
    placeName: this.fb.control<string | null>(null, []),
    durationMinutes: this.fb.control<number | null>(null, []),
    deliveryId: this.fb.control<null | number>(null, []),
    reservedAt: this.fb.control<string | null>(null, [Validators.required]),
    // payingCash: this.fb.control<null | number>(null, []),
    // cashAccountId: this.fb.control<null | number>(null, [Validators.required]),
    // payingNetwork: this.fb.control<null | number>(null, []),
    // networkAccountId: this.fb.control<null | number>(null, [Validators.required]),
    refund: this.fb.control<null | number>(null, []),
    customerRequest: this.fb.group({
      id: this.fb.control<null | number>(null, [Validators.required]),
      nameAr: this.fb.control<string | null>(null, [Validators.required]),
      nameEn: this.fb.control<string | null>(null, [Validators.required]),
      phoneNumber: this.fb.control<string | null>(null, this.phoneNumberValidators),
      secondaryMobileNumber: this.fb.control<string | null>(null, []),
      addressDescription: this.fb.control<string | null>(null, [Validators.required]),
    }),
  });

  tranferanceFgOrderTypeListener = this.transferanceFg.controls.orderType.valueChanges.subscribe((orderType) => {
    this.orderTransferenceType.set(orderType);
    const { deliveryId, placeRefId, durationMinutes, placeType } = this.transferanceFg.controls;

    const { phoneNumber, addressDescription } = this.transferanceFg.controls.customerRequest.controls;

    // payingCash?.disable();
    // payingNetwork?.disable();

    [deliveryId, durationMinutes, placeRefId, placeType, phoneNumber, addressDescription].forEach((control) =>
      control.clearValidators(),
    );

    durationMinutes?.setValue(null);

    switch (orderType) {
      case OrderLocationType.DineIn:
        // payingCash?.enable();
        // payingNetwork?.enable();
        durationMinutes?.setValidators([Validators.required]);
        placeRefId?.setValidators([Validators.required]);
        placeType?.setValidators([Validators.required]);
        durationMinutes?.setValue(30);
        break;

      case OrderLocationType.CompanyDelivery:
        // payingCash?.enable();
        // payingNetwork?.enable();
        addressDescription?.setValidators([Validators.required]);
        deliveryId?.setValidators([Validators.required]);
        break;
      case OrderLocationType.PersonDelivery:
        // payingCash?.enable();
        // payingNetwork?.enable();
        phoneNumber?.setValidators(this.phoneNumberValidators);
        addressDescription?.setValidators([Validators.required]);
        deliveryId?.setValidators([Validators.required]);
        break;
    }

    deliveryId?.updateValueAndValidity();
    durationMinutes?.updateValueAndValidity();
    placeRefId?.updateValueAndValidity();
    placeType?.updateValueAndValidity();
    phoneNumber?.updateValueAndValidity();
    addressDescription?.updateValueAndValidity();
  });

  isConfirmTransference = false;

  submitOrderTransference() {
    this.transferanceFg.controls.customerRequest.patchValue({
      nameEn: this.transferanceFg.value?.customerRequest?.nameAr,
    });
    console.log(this.transferanceFg.getRawValue());
    if (this.transferanceFg.invalid) {
      //log erros
      console.log('invalid');
      Object.entries(this.transferanceFg.controls).forEach(([key, control]) => {
        console.log(key, control.errors);
      });
      this.transferanceFg.markAllAsTouched();
      return;
    }

    let values = this.transferanceFg.getRawValue() as IOrderChangeTypeRequest;
    if (!this.isConfirmTransference) {
      Object.assign(values, { payingCash: null, payingNetwork: null, simulateOnly: true });
    }else{
      Object.assign(values, { simulateOnly: false });
    }

    this.orderService.changeType(values).subscribe({
      next: (dto) => {
        if (!this.isConfirmTransference) {
          this.toBePaidToClient.set(dto?.invoice?.toBePaid?.amount || 0);
          this.isConfirmTransference = true;
        } else {
          this.searchOrders(1);
          this.closeInvoiceTypeChangeDialog();
          this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم تغيير نوع الطلب بنجاح' });
        }
      },
    });
  }

  //#endregion

  //
  //#region transferance calculations
  //

  deliveryFee = computed(() => {
    if (
      this.orderTransferenceType() !== OrderLocationType.PersonDelivery &&
      this.orderTransferenceType() !== OrderLocationType.CompanyDelivery
    )
      return 0;

    const baseFeeValue = this.financialSettings()?.deliveryFee;
    let fee = 0;

    //tax

    if (this.financialSettings()?.deliveryFeeType == AmountType.Fixed) {
      fee = baseFeeValue * (1 + this.financialSettings()?.vat / 100);
    } else {
      // const itemsWithSelectiveTaxSum = this.orderMenuItems().reduce(
      //   (total, item) => total + this.getMenuItemPriceWithAdditionsWithSelectiveTax(item),
      //   0,
      // );

      // const feeAmount = itemsWithSelectiveTaxSum * (baseFeeValue / 100);
      // console.log('delivery fee before tax:', feeAmount);
      // fee = feeAmount * (1 + this.financialSettings()?.vat / 100);
      // console.log('delivery fee after tax:', fee);

      const taxedFeePercentage = baseFeeValue * (1 + this.financialSettings()?.vat / 100);
      fee = this.currentOrderNet() * (taxedFeePercentage / 100);
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

  serviceFee = computed(() => {
    let serviceFee = 0;

    if (this.orderTransferenceType() == OrderLocationType.DineIn) {
      const net = this.currentOrderNet();
      if (this.financialSettings().serviceFeeType == AmountType.Percentage) {
        let taxedServiceFeePercentage = this.financialSettings().serviceFee * (1 + this.financialSettings().vat / 100);
        serviceFee = net * (taxedServiceFeePercentage / 100);
      } else {
        serviceFee = this.financialSettings().serviceFee * (1 + this.financialSettings().vat / 100);
      }
    }

    return serviceFee;
  });

  // itemsDiscountAmount = computed(() => {
  //   const discountValue = this.financialSettings().discount;
  //   if (this.financialSettings().discountType == AmountType.Fixed) {
  //     return discountValue;
  //   } else if (this.financialSettings().discountType == AmountType.Percentage) {
  //     return this.orderItemsNet() * (discountValue / 100);
  //   } else {
  //     return 0;
  //   }
  // });

  // netListener = effect(() => {
  //   let net = this.net();

  //   this.orderFg.patchValue({
  //     payingCash: net,
  //     payingNetwork: 0,
  //   });
  // });

  //#endregion

  //
  //#region customer
  //

  currentCustomer = signal<{
    id: number;
    nameAr: string;
    nameEn: string;
    phoneNumber: string;
    secondaryMobileNumber: string;
    addressDescription: string;
  } | null>(null);
  currentCustomerChangeEffect = effect(() => {
    // if (this.currentCustomer()) {
    //   this.customerFg.patchValue({
    //     id: this.currentCustomer()?.id,
    //     phoneNumber: this.currentCustomer()?.phoneNumber,
    //     addressDescription: this.currentCustomer()?.addressDescription,
    //   });
    // } else {
    //   this.customerFg.patchValue({
    //     id: this.cashCustomer.id,
    //     phoneNumber: this.cashCustomer.phoneNumber + '',
    //     addressDescription: 'عميل نقدي',
    //   });
    // }
    // this.orderFg.patchValue({
    //   customerRequest: this.currentCustomer(),
    // });
  });
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
      this.transferanceFg.controls.customerRequest.patchValue({
        id: event.id,
        nameAr: event.name,
        nameEn: event.name,
        phoneNumber: event.phoneNumber,
        secondaryMobileNumber: event.secondaryMobileNumber,
        addressDescription: event.city + ', ' + event.district + ', ' + event.street + ', ' + event.buildingNumber,
      });
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

  //#endregion

  //
  //#region payment info
  //

  paymentDialogVisible = false;

  showPaymentDialog() {
    this.paymentDialogVisible = true;
  }

  // getPaymentInvalidControl() {
  //   const cashControl = this.transferanceFg.controls.payingCash;
  //   const networkControl = this.transferanceFg.controls.payingNetwork;
  //   if (cashControl?.invalid && cashControl?.touched) {
  //     return cashControl;
  //   } else if (networkControl?.invalid && networkControl?.touched) {
  //     return networkControl;
  //   }
  //   return null;
  // }

  isPaid = signal<boolean>(true);

  // isPaidListener = effect(() => {
  //   // let validators: ValidatorFn[] = [];
  //   const cashControl = this.transferanceFg.controls.payingCash;
  //   const networkControl = this.transferanceFg.controls.payingNetwork;
  //   this.transferanceFg.patchValue({
  //     payingCash: 0,
  //     payingNetwork: 0,
  //   });
  //   if (this.isPaid()) {
  //     // validators = [Validators.required];
  //     cashControl?.enable();
  //     networkControl?.enable();
  //   } else {
  //     cashControl?.disable();
  //     networkControl?.disable();
  //   }
  //   // cashControl?.setValidators(validators);
  //   // networkControl?.setValidators(validators);
  // });

  // cashInputSubscription = this.transferanceFg.controls.payingCash?.valueChanges.subscribe((value) => {
  //   const transferenceCost = this.transferenceCost();
  //   let futureValue = value ?? 0;
  //   if (futureValue > transferenceCost) {
  //     futureValue = transferenceCost;
  //   } else if (futureValue < 0) {
  //     futureValue = 0;
  //   }
  //   this.transferanceFg.patchValue(
  //     {
  //       payingNetwork: transferenceCost - futureValue,
  //       payingCash: futureValue,
  //     },
  //     { emitEvent: false },
  //   );
  // });

  // networkInputSubscription = this.transferanceFg.controls.payingNetwork?.valueChanges.subscribe((value) => {
  //   const transferenceCost = this.transferenceCost();
  //   let futureValue = value ?? 0;
  //   if (futureValue > transferenceCost) {
  //     futureValue = transferenceCost;
  //   } else if (futureValue < 0) {
  //     futureValue = 0;
  //   }
  //   this.transferanceFg.patchValue(
  //     {
  //       payingCash: transferenceCost - futureValue,
  //       payingNetwork: futureValue,
  //     },
  //     { emitEvent: false },
  //   );
  // });

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

  // #endregion

  //
  //local space
  //

  //
  //#region huts
  //

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

    if (this.transferanceFg.value.placeType == OrderLocalType.Hut && this.currentHut()) {
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
          pageSize: 30,
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
      this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم اختيار الموقع' });
      this.transferanceFg.patchValue({ placeRefId: hut.id, placeType: OrderLocalType.Hut });
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
    this.transferanceFg.patchValue({
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

  // #endregion

  //
  //#region tables
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
          pageSize: 30,
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
      this.transferanceFg.patchValue({ placeRefId: table.id, placeType: OrderLocalType.Table });
      this.TableDialogVisible = false;
      this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم اختيار الموقع' });
    } else {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'الموقع مشغول' });
    }
  }

  // #endregion

  //
  //#region rooms
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
      this.transferanceFg.patchValue({ placeRefId: room.id, placeType: OrderLocalType.Room });
      this.RoomDialogVisible = false;
      this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم اختيار الموقع بنجاح' });
    } else {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'الموقع مشغول' });
    }
  }

  // #endregion

  //
  //#region deliveries
  //

  DeliveryDialogVisible: boolean = false;

  deliveryService = inject(DeliveryService);
  deliveries = signal<IDeliverySearchRow[]>([]);
  companyDeliveries = signal<ICustomerSearchRow[]>([]);

  isCompanyDelivery: boolean = false;

  changeDeliveryType(isCompany: boolean) {
    this.isCompanyDelivery = isCompany;
    this.transferanceFg.patchValue({
      orderType: isCompany ? OrderLocationType.CompanyDelivery : OrderLocationType.PersonDelivery,
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
    this.transferanceFg.patchValue({ deliveryId });
    this.DeliveryDialogVisible = false;
    this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم اختيار الدليفري بنجاح' });
    // } else {
    //   this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'الموقع مشغول' });
    // }
  }

  // #endregion
}
