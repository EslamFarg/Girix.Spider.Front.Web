import { OrderLocalType, OrderLocationType, OrderPaymentType } from './enums';

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
  placeName: string;
  reservedAt: string;
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
  cashAccountId: number;
  networkAccountId: number;
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

export interface IOrderChangeTypeRequest {
  id: number
  simulateOnly: boolean
  orderType: number
  placeType: number
  placeRefId: number
  placeName: string
  durationMinutes: number
  deliveryId: number
  reservedAt: string
  payingCash: number
  payingNetwork: number
  refund: number
  cashAccountId: number
  networkAccountId: number
  customerRequest: IOrderChangeTypeCustomerRequest
}

export interface IOrderChangeTypeCustomerRequest {
  id: number
  nameAr: string
  nameEn: string
  phoneNumber: string
  secondaryMobileNumber: string
  addressDescription: string
}

