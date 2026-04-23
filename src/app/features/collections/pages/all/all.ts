import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { CollectionsService } from '../../services/collections-service';
import { OrderSearchEnum, OrderService, IOrderSearchRow, OrderLocationType, OrderLocalType } from '@/features/orders';
import { MenuItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { CustomerSearchEnum, CustomerService } from '@/features/customers/services/customer-service';
import { ICustomerSearchRow } from '@/features/customers/services/customer-types';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { TranslatePipe } from '@ngx-translate/core';
import { AllowNumbers } from "@/directives/allow-numbers";
import { FinancialAccountSearchEnum, FinancialAccountService } from '@/features/accounts/services/financial-account-service';
import { ITreeFinancialAccountSearchRow } from '@/features/accounts/types';
import { noSymbolsAllowed } from '@/yn-ng';

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
    AllowNumbers
],
  templateUrl: './all.html',
  styleUrl: './all.css',
})
export class All extends BaseComponent {
  OrderLocationType = OrderLocationType;
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<OrderSearchEnum>(OrderSearchEnum.CustomerName, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };

  fg = this.fb.group(this.initialSearchFormValue);

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
    effect(() => {
      this.collectionsService.lastCollectedId();
      this.searchOrders(1);
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
  //
  //
  //
  //
  //
  collectionsService = inject(CollectionsService);

  openCollectionDialog = this.collectionsService.openCollectionDialog;

  isInvoiceTypeChangeDialogVisible = false;

  openInvoiceTypeChangeDialog() {
    this.isInvoiceTypeChangeDialogVisible = true;
  }

  closeInvoiceTypeChangeDialog() {
    this.isInvoiceTypeChangeDialogVisible = false;
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
  orderLocationType=OrderLocationType;


  transferanceFg = this.fb.group({
    id: this.fb.control<null | number>(null, [Validators.required]),
    simulateOnly: this.fb.control<boolean>(false, [Validators.required]),
    // dinein/delivery/takeaway
    orderType: this.fb.control<null | OrderLocationType>(null, [Validators.required]),
    // hut/cabin/room
    placeType: this.fb.control<null | OrderLocalType>(null, [Validators.required]),
    // hut/cabin/room id
    placeRefId: this.fb.control<null | number>(null, [Validators.required]),
    placeName: this.fb.control<string | null>(null, [Validators.required]),
    durationMinutes: this.fb.control<null | number>(null, [Validators.required]),
    deliveryId: this.fb.control<null | number>(null, [Validators.required]),
    reservedAt: this.fb.control<string | null>(null, [Validators.required]),
    payingCash: this.fb.control<null | number>(null, [Validators.required]),
    cashAccountId: this.fb.control<null | number>(null, [Validators.required]),
    payingNetwork: this.fb.control<null | number>(null, [Validators.required]),
    networkAccountId: this.fb.control<null | number>(null, [Validators.required]),
    refund: this.fb.control<null | number>(null, [Validators.required]),
    customerRequest: this.fb.group({
      id: this.fb.control<null | number>(null, [Validators.required]),
      nameAr: this.fb.control<string | null>(null, [Validators.required]),
      nameEn: this.fb.control<string | null>(null, [Validators.required]),
      phoneNumber: this.fb.control<string | null>(null, [Validators.required]),
      secondaryMobileNumber: this.fb.control<string | null>(null, [Validators.required]),
      addressDescription: this.fb.control<string | null>(null, [Validators.required])
    }),
  });

  net=signal<number>(0);
  

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
  //customer
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
  //payment info
  //

  paymentDialogVisible = false;

  showPaymentDialog() {
    this.paymentDialogVisible = true;
  }

  getPaymentInvalidControl() {
    const cashControl = this.transferanceFg.controls.payingCash;
    const networkControl = this.transferanceFg.controls.payingNetwork;
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
    const cashControl = this.transferanceFg.controls.payingCash;
    const networkControl = this.transferanceFg.controls.payingNetwork;
    this.transferanceFg.patchValue({
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

  cashInputSubscription = this.transferanceFg.get('payingCash')?.valueChanges.subscribe((value) => {
    const net = this.net();
    let futureValue = value ?? 0;
    if (futureValue > net) {
      futureValue = net;
    } else if (futureValue < 0) {
      futureValue = 0;
    }
    this.transferanceFg.patchValue(
      {
        payingNetwork: net - futureValue,
        payingCash: futureValue,
      },
      { emitEvent: false },
    );
  });

  networkInputSubscription = this.transferanceFg.get('payingNetwork')?.valueChanges.subscribe((value) => {
    const net = this.net();
    let futureValue = value ?? 0;
    if (futureValue > net) {
      futureValue = net;
    } else if (futureValue < 0) {
      futureValue = 0;
    }
    this.transferanceFg.patchValue(
      {
        payingCash: net - futureValue,
        payingNetwork: futureValue,
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
}
