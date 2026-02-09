import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { IMenuItem, IOrderMenuItem, Menu } from '../../components/menu/menu';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { ImgFallback } from '@/directives/img-fallback';
import { Button, ButtonDirective } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { GeneralService, ProductAndMealsSearchEnum } from '../../services/general-service';
import { BaseComponent, FormMode, IPaginationInfo } from '@/components/base-component/base-component';
import {
  FormArray,
  FormControl,
  Validators,
  ɵInternalFormsSharedModule,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';
import { IProductSearchRow, ProductSearchEnum, ProductService } from '@/features/classes/services/product-service';
import { IMealSearchRow } from '@/features/classes/services/meal-service';
import { GroupService, IGroupSearchRow, IGroupSearchResponseValue } from '@/features/classes/services/group-service';
import { AllowNumbers } from '@/directives/allow-numbers';
import { GalleriaModule } from 'primeng/galleria';
import { Slider } from '../../../../components/slider/slider';
import {
  IOrderCreateCustomerRequest,
  IOrderCreateItem,
  IOrderCreateRequest,
  OrderPaymentType,
  OrderLocalType,
  OrderService,
  OrderLocationType,
  IOrderReadResponse,
  IOrderCreateItemAddon,
} from '@/features/invoices/services/order-service';
import { HutCard } from '@/components/hut-card/hut-card';
import { RoomCard } from '@/components/room-card/room-card';
import { TableCard } from '@/components/table-card/table-card';
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
import { PrintService } from '@/features/print/services/print-service';

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
  customerRequest: FormControl<IOrderCreateCustomerRequest | null>;
  placeName: FormControl<string | null>;
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
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home extends BaseComponent {
  //enums
  OrderLocationType = OrderLocationType;
  OrderLocalType = OrderLocalType;
  OrderPaymentType = OrderPaymentType;
  formMode = signal<FormMode>(FormMode.Create);
  isCreateMode = computed(() => this.formMode() == FormMode.Create);

  //
  isMenuVisible: boolean = false;

  //dialogs
  additionsDialogVisible: boolean = false;
  HutDialogVisible: boolean = false;
  TableDialogVisible: boolean = false;
  RoomDialogVisible: boolean = false;
  //

  groupsService = inject(GroupService);
  groups = signal<IGroupSearchRow[]>([]);
  orderService = inject(OrderService);

  existingOrder = signal<IOrderReadResponse | null>(null);

  orderCreateItems = computed<IOrderCreateItem[]>(() => {
    console.log(this.orderMenuItems());
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
    items: this.fb.control<IOrderCreateItem[]>([], [Validators.minLength(1)]),
    customerRequest: this.fb.control<IOrderCreateCustomerRequest | null>(null, []),
  };

  orderFg = this.fb.group(this.initialOrderFgValue);
  orderCalculationsService = inject(OrderCalculationsService);
  getMenuItemTaxValue = this.orderCalculationsService.getMenuItemTaxValue;
  getMenuItemNetValue = this.orderCalculationsService.getMenuItemNetValue;
  orderMenuItems = signal<IOrderMenuItem[]>([]);

  /**
   *
   */
  constructor() {
    super();
    this.groupsService.getList(false, { pageIndex: 0, pageSize: 0 }).subscribe({
      next: (res) => {
        this.groups.set(res.rows);
      },
    });

    this.searchHuts(1);
    this.searchRooms(1);
    this.searchTables(1);
    this.searchAdditions(1);
    this.searchCustomers({ pageIndex: 1, searchTerm: '' });
  }

  onMenuItemChange(changedItem: IOrderMenuItem) {
    const existingItem = this.orderMenuItems().find((item) => item.menuItem.id == changedItem.menuItem.id);
    if (existingItem) {
      const futureQuantity = existingItem.menuItem.quantity + changedItem.menuItem.quantity;

      if (futureQuantity >= 1000) {
        this.orderMenuItems.update((items) =>
          items.map((item) =>
            item.menuItem.id == existingItem.menuItem.id
              ? { ...item, menuItem: { ...item.menuItem, quantity: 1000 } }
              : item,
          ),
        );
        return;
      }

      if (futureQuantity <= 0) {
        this.orderMenuItems.update((items) => items.filter((item) => item.menuItem.id != changedItem.menuItem.id));
        return;
      }

      this.orderMenuItems.update((items) =>
        items.map((item) =>
          item.menuItem.id == existingItem.menuItem.id
            ? { ...item, menuItem: { ...item.menuItem, quantity: futureQuantity } }
            : item,
        ),
      );
    } else {
      if (changedItem.menuItem.quantity <= 0) return;
      this.orderMenuItems.update((items) => items.concat(changedItem));
    }
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

  onSubmitOrder() {
    this.orderFg.patchValue({
      items: this.orderCreateItems(),
      customerRequest: this.currentCustomer(),
    });
    console.log(this.orderFg.value);
    if (this.orderFg.invalid) {
      console.log('invalid order');
      this.orderFg.markAllAsTouched();
      return;
    }
    this.orderService.create(this.orderFg.value).subscribe({
      next: (res) => {},
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
  //print
  //

  printService=inject(PrintService);

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
  //local space
  //

  //huts

  hutService = inject(HutService);
  huts = signal<IHutSearchRow[]>([]);
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

  onHutsScroll(event: Event) {
    const menuContainer = event.target as HTMLElement;

    // if at bottom
    if (menuContainer.scrollTop + menuContainer.clientHeight >= menuContainer.scrollHeight - 1) {
      this.searchHuts(this.hutPaginationInfo.pageIndex + 1);
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
  //tables

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
  onTablesScroll(event: Event) {
    const menuContainer = event.target as HTMLElement;

    // if at bottom
    if (menuContainer.scrollTop + menuContainer.clientHeight >= menuContainer.scrollHeight - 1) {
      this.searchTables(this.tablePaginationInfo.pageIndex + 1);
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
  //rooms
  //

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
  onRoomsScroll(event: Event) {
    const menuContainer = event.target as HTMLElement;

    // if at bottom
    if (menuContainer.scrollTop + menuContainer.clientHeight >= menuContainer.scrollHeight - 1) {
      this.searchRooms(this.roomPaginationInfo.pageIndex + 1);
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
  //additions
  //

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
  searchAdditions(pageIndex: number) {
    this.productService
      .getAdditions({
        dto: {
          paginationInfo: {
            pageIndex: pageIndex,
            pageSize: 20,
          },
        },
        isAddition: true,
      })
      .subscribe({
        next: (res) => {
          if (res.rows.length > 0) {
            this.additionProducts.update((prev) => prev.concat(res.rows));
            this.additionPaginationInfo = {
              pageIndex,
              totalPagesCount: res.paginationInfo.totalPagesCount,
              totalRowsCount: res.paginationInfo.totalRowsCount,
            };
          }
        },
      });
  }
  onAdditionsScroll(event: Event) {
    const menuContainer = event.target as HTMLElement;

    // if at bottom
    if (menuContainer.scrollTop + menuContainer.clientHeight >= menuContainer.scrollHeight - 1) {
      this.searchAdditions(this.additionPaginationInfo.pageIndex + 1);
    }
  }

  showAdditionsDialog(currentMenuItemIx: number) {
    this.currentMenuItemIx.set(currentMenuItemIx);
    this.additionsDialogVisible = true;
  }

  addAddition(item: IProductSearchRow, quantity: number) {
    const previousAdditionIx = this.orderMenuItems()[this.currentMenuItemIx()].additions.findIndex(
      (addition) => addition.product.id === item.id,
    );

    if (previousAdditionIx > -1) {
      const previousAddition = this.orderMenuItems()[this.currentMenuItemIx()].additions[previousAdditionIx];

      //check if new quantity is less or equal 1000
      if (previousAddition.quantity + quantity > 1000) {
        this._updateAdditionQuantity(1000, previousAdditionIx, item);
      } else {
        this._updateAdditionQuantity((previousAddition.quantity += quantity), previousAdditionIx, item);
      }
    } else {
      this._updateAdditionQuantity(quantity, previousAdditionIx, item);
    }
  }

  removeAddition(item: IProductSearchRow, quantity: number) {
    const previousAdditionQuantity = this.orderMenuItems()[this.currentMenuItemIx()].additions.find(
      (addition) => addition.product.id === item.id,
    )!.quantity;

    this._updateAdditionQuantity(previousAdditionQuantity - quantity, -1, item);
  }

  _updateAdditionQuantity(quantity: number, additionIx: number, item: IProductSearchRow) {
    if (additionIx > -1) {
      //update quantity
      if (quantity > 0) {
        this.orderMenuItems.update((orderItems) =>
          orderItems.map((orderItem, i) =>
            i == this.currentMenuItemIx()
              ? {
                  ...orderItem,
                  additions: orderItem.additions.map((addition, j) =>
                    j == additionIx ? { ...addition, quantity } : addition,
                  ),
                }
              : orderItem,
          ),
        );
      } else {
        this.orderMenuItems.update((orderItems) =>
          orderItems.map((orderItem, i) =>
            i == this.currentMenuItemIx()
              ? {
                  ...orderItem,
                  additions: orderItem.additions.filter((addition, j) => j != additionIx),
                }
              : orderItem,
          ),
        );
      }
    } else {
      //add new
      this.orderMenuItems.update((orderItems) =>
        orderItems.map((orderItem, i) =>
          i == this.currentMenuItemIx()
            ? { ...orderItem, additions: orderItem.additions.concat({ product: item, quantity: quantity }) }
            : orderItem,
        ),
      );
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
  showCustomerDialog() {
    this.customerDialogVisible = true;
  }

  customerFgInitialValue = {
    id: this.fb.control<number | null>(null, []),
    phoneNumber: this.fb.control<string | null>(null, []),
    addressDescription: this.fb.control<string | null>(null, []),
  };

  customerFg = this.fb.group(this.customerFgInitialValue);

  // onSubmitCustomer() {
  //   if (this.customerFg.invalid) {
  //     this.customerFg.markAllAsTouched();
  //     return;
  //   }
  //   this.currentCustomer.set({
  //     id: this.customerFg.value.id!,
  //     nameAr: this.customerFg.value.nameAr!,
  //     nameEn: this.customerFg.value.nameEn!,
  //     phoneNumber: this.customerFg.value.phoneNumber!,
  //     secondaryMobileNumber: this.customerFg.value.secondaryMobileNumber!,
  //     addressDescription: this.customerFg.value.addressDescription!,
  //   });

  //   this.customerDialogVisible = false;
  // }

  customersService = inject(CustomerService);

  customers = signal<ICustomerSearchRow[]>([]);
  displayedCustomers = computed(() => [
    {
      id: 0,
      name: 'عميل نقدي',
      phoneNumber: 0,
    },
    ...this.customers(),
  ]);
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
    console.log('selected customer: ', event);
    if (event.id) {
      this.customerFg.patchValue({
        id: event.id,
        phoneNumber: event.phoneNumber,
        addressDescription: event.city + ', ' + event.district + ', ' + event.street + ', ' + event.buildingNumber,
      });
      this.currentCustomer.set({
        id: event.id,
        nameAr: event.name,
        nameEn: event.name,
        phoneNumber: event.phoneNumber,
        secondaryMobileNumber: event.secondaryMobileNumber,
        addressDescription: event.city + ', ' + event.district + ', ' + event.street + ', ' + event.buildingNumber,
      });
    } else {
      this.customerFg.patchValue({
        id: event.id,
        phoneNumber: event.phoneNumber,
        addressDescription: 'عميل نقدي',
      });
      this.currentCustomer.set(null);
    }
  }
  onCustomersNameSearch(event: any, searchTerm: string = '') {
    const isNewSearchTerm = searchTerm != this.previousCustomersSearchTerm;

    if (!searchTerm || searchTerm.length > 100) return;
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

  net = computed(() => {
    const orderItems = this.orderMenuItems();
    let net = 0;
    orderItems.forEach((item) => {
      net += this.getMenuItemNetValue(item);
    });

    return net;
  });

  netListener = effect(() => {
    const net = this.net();
    this.orderFg.patchValue({
      payingCash: net,
      payingNetwork: 0,
    });
  });

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

  isPaid = signal<boolean>(false);

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
      cashControl?.disable();
      networkControl?.disable();
    }
    cashControl?.setValidators(validators);
    networkControl?.setValidators(validators);
  });

  cashInputSubscription = this.orderFg.get('payingCash')?.valueChanges.subscribe((value) => {
    const net = this.net();
    this.orderFg.patchValue(
      {
        payingNetwork: net - +(value ?? 0),
      },
      { emitEvent: false },
    );
  });

  networkInputSubscription = this.orderFg.get('payingNetwork')?.valueChanges.subscribe((value) => {
    const net = this.net();
    this.orderFg.patchValue(
      {
        payingCash: net - +(value ?? 0),
      },
      { emitEvent: false },
    );
  });
}
