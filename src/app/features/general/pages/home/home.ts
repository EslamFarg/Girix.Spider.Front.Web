import { Component, inject, signal } from '@angular/core';
import { IMenuItem, IOrderMenuItem, Menu } from '../../components/menu/menu';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { ImgFallback } from '@/directives/img-fallback';
import { DrawerModule } from 'primeng/drawer';
import { GeneralService, ProductAndMealsSearchEnum } from '../../services/general-service';
import { BaseComponent } from '@/components/base-component/base-component';
import { FormArray, FormControl, Validators, ɵInternalFormsSharedModule, ReactiveFormsModule } from '@angular/forms';
import { IProductRowResponse } from '@/features/classes/services/product-service';
import { IMealRowResponse } from '@/features/classes/services/meal-service';
import { GroupService, IGroupRowResponse, IGroupSearchResponseValue } from '@/features/classes/services/group-service';
import { AllowNumbers } from '@/directives/allow-numbers';
import {
  IOrderCreateCustomerRequest,
  IOrderCreateItem,
  IOrderCreateRequest,
  OrderPaymentType,
  OrderLocalType,
  OrderService,
  OrderLocationType,
} from '@/features/invoices/services/order-service';
import { CabinCard } from "@/features/collections/components/cabin-card/cabin-card";
import { RoomCard } from "@/features/collections/components/room-card/room-card";
import { TableCard } from "@/features/collections/components/table-card/table-card";

//this interface has the same keys as IOrderCreateRequest but different valeus
interface IOrderCreateFgValue {
  orderType: FormControl<OrderLocationType>;
  paymentType: FormControl<OrderPaymentType>;
  placeType: FormControl<OrderLocalType>;
  placeRefId: FormControl<number>;
  durationMinutes: FormControl<number>;
  deliveryId: FormControl<number>;
  payingCash: FormControl<number>;
  payingNetwork: FormControl<number>;
  createAt: FormControl<string>;
  idempotencyKey: FormControl<string>;
  items: FormControl<IOrderCreateItem[]>;
  customerRequest: FormControl<IOrderCreateCustomerRequest>;
}

@Component({
  selector: 'app-home',
  imports: [Menu, ButtonModule, ReactiveFormsModule, Dialog, InputTextModule, AvatarModule, ImgFallback, DrawerModule, AllowNumbers, ɵInternalFormsSharedModule, ReactiveFormsModule, CabinCard, RoomCard, TableCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home extends BaseComponent {
  //enums
  OrderLocationType = OrderLocationType;
  OrderLocalType = OrderLocalType;
  OrderPaymentType = OrderPaymentType;
  //
  isMenuVisible: boolean = false;

  //dialogs
  visible: boolean = false;
  HutDialogVisible: boolean = false;
  TableDialogVisible: boolean = false;
  RoomDialogVisible: boolean = false;
  //

  groupsService = inject(GroupService);
  groups = signal<IGroupRowResponse[]>([]);
  orderService = inject(OrderService);

  initialOrderFgValue: IOrderCreateFgValue = {
    orderType: this.fb.control<OrderLocationType>(OrderLocationType.Takeaway, [Validators.required]),
    paymentType: this.fb.control<OrderPaymentType>(OrderPaymentType.Pending, [Validators.required]),
    placeType: this.fb.control<OrderLocalType>(OrderLocalType.Table, [Validators.required]),
    placeRefId: this.fb.control<number>(0, [Validators.required]),
    durationMinutes: this.fb.control<number>(0, [Validators.required]),
    deliveryId: this.fb.control<number>(0, [Validators.required]),
    payingCash: this.fb.control<number>(0, [Validators.required]),
    payingNetwork: this.fb.control<number>(0, [Validators.required]),
    createAt: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
    idempotencyKey: this.fb.control<string>(Math.random().toString(), [Validators.required]),
    items: this.fb.control<IOrderCreateItem[]>([], [Validators.required]),
    customerRequest: this.fb.control<IOrderCreateCustomerRequest>(
      {
        id: 0,
        nameAr: '',
        nameEn: '',
        phoneNumber: '',
        secondaryMobileNumber: '',
        addressDescription: '',
      },
      [Validators.required],
    ),
  };

  orderFg = this.fb.group(this.initialOrderFgValue);

  orderMenuItems: IOrderMenuItem[] = [];

  showDialog() {
    this.visible = true;
  }

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
  }

  onMenuItemChange(changedItem: IOrderMenuItem) {
    const existingItemIx = this.orderMenuItems.findIndex((item) => item.menuItem.id == changedItem.menuItem.id);

    if (existingItemIx > -1) {
      const futureQuantity = this.orderMenuItems[existingItemIx].quantity + changedItem.quantity;

      if (futureQuantity >= 1000) {
        this.orderMenuItems[existingItemIx].quantity = 1000;
        return;
      }

      this.orderMenuItems[existingItemIx].quantity += changedItem.quantity;
      if (this.orderMenuItems[existingItemIx].quantity <= 0) this.orderMenuItems.splice(existingItemIx, 1);
    } else {
      if (changedItem.quantity <= 0) return;
      this.orderMenuItems.push(changedItem);
    }
  }

  onReduceOrderMenuItemQuantity(index: number, quantity: number) {
    this.orderMenuItems[index].quantity -= quantity;
    if (this.orderMenuItems[index].quantity <= 0) this.orderMenuItems.splice(index, 1);
  }

  onAddOrderMenuItemQuantity(index: number, quantity: number) {
    const futureQuantity = this.orderMenuItems[index].quantity + quantity;
    if (futureQuantity >= 1000) {
      this.orderMenuItems[index].quantity = 1000;
    } else {
      this.orderMenuItems[index].quantity += quantity;
    }
  }



}
