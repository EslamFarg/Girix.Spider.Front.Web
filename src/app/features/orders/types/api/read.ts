//gey by id

import { OrderLocationType } from "./enums";

export interface IOrderReadResponse {
  id: number;
  orderNumber: string;
  orderType: number;
  paymentType: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerSecondaryPhone: string;
  customerAdress: string;
  deliveryId: any;
  deliveryFee: number;
  deliveryFeeTax: number;
  placeType: number;
  placeRefId: number;
  durationMinutes: any;
  priceForPlace: number;
  placeTax: number;
  createdAt: string;
  discountType: number;
  discountPercentage: number;
  discountValue: number;
  totalSelectiveTax: number;
  totalTaxForItems: number;
  serviceFee: number;
  serviceFeeTax: number;
  totalTax: number;
  totalPriceForItems: number;
  totalCostPriceForItems: number;
  netOrder: number;
  payingCash: number;
  payingNetwork: number;
  isCollected: boolean;
  items: IOrderReadItem[];
}

export interface IOrderReadItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  mealId: any;
  mealName: any;
  additionalMenuItemId: any;
  quantity: number;
  price: number;
  totalPrice: number;
  priceAfterDiscount: number;
  totalPriceAfterDiscount: number;
  totalTaxValueAfterDiscount: number;
  totalSelectiveTaxValueAfterDiscount: number;
  priceWithSelectiveTaxAndTaxAfterDiscount: number;
  totalWithSelectiveTaxAndTaxAfterDiscount: number;
}

export interface IOrderBillReadResponse {
  id: number;
  invoiceNo: string;
  orderNo: string;
  paymentType: number;
  dateTime: string;
  orderType: number;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  place: {
    placeId: number;
    placeType: number;
    placeName: string;
    reservedFrom: string;
    reservedTo: string;
    durationMinutes: number;
  };
  placeTransactions: {
    id: number;
    placeType: number;
    placeRefId: number;
    placeName: string;
    amount: number;
    tax: number;
    total: number;
    startFrom: string;
    endTo: string;
    createdAt: string;
  }[];
  orderLogs: any[];
  items: {
    id: number;
    menuItemId: number;
    mealId: any;
    name: string;
    qty: number;
    returnedQty: number;
    remainingQty: number;
    unitPrice: number;
    selectiveTax: number;
    netUnitPrice: number;
    unitPriceWithTax: number;
    netUnitPriceWithTax: number;
    printer: {
      id: number;
      name: string;
      ipAddressOrMacAddress: string;
      port: number;
      type: number;
    };
    modifiers: IModifier[];
  }[];
  summary: {
    totalUnitPrice: number;
    discountAmount: number;
    discountPercentage: number;
    serviceFeeType: number;
    systemServiceFee: number;
    systemVat: number;
    totalSelectiveTax: number;
    vatAmount: number;
    serviceFee: number;
    priceForPlace: number;
    durationMinutes: number;
    totalNet: number;
    netReturnOrder: number;
  };
  payments: {
    payingCash: number;
    payingNetwork: number;
    remaining: number;
  };
  toBePaid: {
    beforeNetOrder: number;
    afterNetOrder: number;
    amount: number;
  };
}

export interface IModifier {
  id: number
  name: string
  qty: number
  returnedQty: number
  remainingQty: number
  unitPrice: number
  selectiveTax: number
  netUnitPrice: number
  unitPriceWithTax: number
  netUnitPriceWithTax: number
  printer: IModifierPrinter
}

export interface IModifierPrinter {
  id: number
  name: string
  ipAddressOrMacAddress: string
  port: number
  comPort: string
  type: number
}


export interface IOrderSearchRow {
  id: number;
  orderNumber: string;
  orderType: OrderLocationType;
  paymentType: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerSecondaryPhone: string;
  customerAdress: string;
  deliveryId: number;
  placeType: number;
  placeRefId: number;
  priceForPlace: number;
  createdAt: string;
  netOrder: number;
  netReturnOrder: number;
  isCollected: boolean;
  payingCash: number;
  payingNetwork: number;
}

//search response

export interface IOrderSearchResponseValue {
  rows: IOrderSearchRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}