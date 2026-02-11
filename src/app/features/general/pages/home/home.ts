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
  FormsModule,
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
import {
  FinancialSettingsService,
  IFinancialSettingsResponse,
} from '@/features/settings/services/financial-settings-service';
import { labeledRequiredValidator } from '@/yn-ng/utils/text-validators';
import { Select, SelectChangeEvent } from 'primeng/select';

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

enum DiscountType {
  Amount = 1,
  Percentage = 2,
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
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home extends BaseComponent {
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
  //
  //
  // order
  //
  orderService = inject(OrderService);
  financialSettingsService = inject(FinancialSettingsService);
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
    items: this.fb.control<IOrderCreateItem[]>([], [Validators.minLength(1), Validators.required]),
    customerRequest: this.fb.control<IOrderCreateCustomerRequest | null>(null, []),
  };

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
    deliveryFeeType: 0,
    minimumSelectiveTax: 0,
    discount: 0,
    discountType: 0,
    serviceFee: 0,
    serviceFeeType: 0,
    vat: 0,
  });

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

    this.financialSettingsService.getSettings().subscribe((res) => this.financialSettings.set(res));

    this.searchHuts(1);
    this.searchRooms(1);
    this.searchTables(1);
    // this.searchAdditions(1);
    this.searchCustomers({ pageIndex: 1, searchTerm: '' });

    this.orderFg.get('orderType')?.valueChanges.subscribe((orderType) => {
      const placeRefId = this.orderFg.get('placeRefId');
      console.log(orderType);
      switch (orderType) {
        case OrderLocationType.Takeaway:
        case OrderLocationType.Delivery:
          placeRefId?.setValidators([]);
          placeRefId?.patchValue(null);
          break;
        case OrderLocationType.DineIn:
          placeRefId!.setValidators([labeledRequiredValidator('يرجى اختيار المكان', 'you must select a place')]);

          break;
      }
      placeRefId?.updateValueAndValidity();
    });
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

    console.log('valid order');
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
  //general calculations
  //
  serviceFee = computed(() => {
    const itemsWithSelectiveTaxSum = this.orderMenuItems().reduce(
      (total, item) => total + this.getMenuItemPriceWithAdditionsWithSelectiveTax(item),
      0,
    );

    const serviceFee = itemsWithSelectiveTaxSum * (this.financialSettings().serviceFee / 100);
    const serviceFeeAfterTax = serviceFee * (this.financialSettings().vat / 100);

    return serviceFeeAfterTax;
  });

  discountAmount = computed(() => {
    const discountValue = this.financialSettings().discount;
    if (this.financialSettings().discountType == DiscountType.Amount) {
      return discountValue;
    } else if (this.financialSettings().discountType == DiscountType.Percentage) {
      return this.orderItemsNet() * (discountValue / 100);
    } else {
      return 0;
    }
  });

  orderItemsNet = computed(() => {
    return this.orderMenuItems().reduce((total, item) => total + this.getMenuItemNetValue(item), 0);
  });

  net = computed(() => {
    const net = this.orderItemsNet() + this.hutNet() + this.serviceFee();

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

  printService = inject(PrintService);

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
  showCustomerDialog() {
    this.customerDialogVisible = true;
  }

  customerFgInitialValue = {
    id: this.fb.control<number | null>(0, []),
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
