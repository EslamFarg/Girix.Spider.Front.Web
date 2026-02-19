import { OrderLocalType, OrderLocationType, OrderPaymentType } from "./enums";

//add items
export interface IOrderAddItemsRequest {
  id: number;
  items: {
    menuItemId: number | null;
    mealId: number | null;
    quantity: number;
    addons: {
      additionalMenuItemId: number;
      quantity: number;
    }[];
  }[];
  dateTime: string;
}


// local place replacement
export interface ILocalPlaceChangeRequest {
  id: number;
  placeType: number;
  placeRefId: number;
  durationMinutes: number | null;
}

export interface IOrderCreateRequest {
  orderType: OrderLocationType;
  paymentType: OrderPaymentType;
  placeType: OrderLocalType;
  placeRefId: number;
  durationMinutes: number;
  deliveryId: number;
  payingCash: number;
  payingNetwork: number;
  createAt: string;
  idempotencyKey: string;
  items: IOrderCreateItem[];
  customerRequest: IOrderCreateCustomer;
}
export interface IOrderCreateItem {
  menuItemId: number | null;
  mealId: number | null;
  quantity: number;
  addons: IOrderCreateItemAddon[];
}

export interface IOrderCreateItemAddon {
  additionalMenuItemId: number;
  quantity: number;
}

export interface IOrderCreateCustomer {
  id: number;
  nameAr: string;
  nameEn: string;
  phoneNumber: string;
  secondaryMobileNumber: string;
  addressDescription: string;
}
