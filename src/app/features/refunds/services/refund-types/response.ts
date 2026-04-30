export interface IRefundSearchRow {
  id: number;
  orderMasterId: number;
  orderReturnDate: string;
  netOrderReturn: number;
  payingCash: number;
  payingNetwork: number;
  createdAt: string;
  paymentType: number;
  customerName: string;
  customerPhone: any;
  customerAdress: any;
}
export interface IRefundSearchResponseValue {
  rows: IRefundSearchRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}

//order latest update details

export interface IOrderLatestUpdateResponse {
  id: number;
  orderNumber: string;
  orderMasterId: number;
  paymentType: number;
  dateTime: string;
  orderType: number;
  customer: IOrderLatestUpdateCustomer;
  place: IOrderLatestUpdatePlace;
  items: IOrderLatestUpdateItem[];
  summary: IOrderLatestUpdateSummary;
  payments: IOrderLatestUpdatePayments;
}

export interface IOrderLatestUpdateCustomer {
  id: number;
  name: string;
  phone: any;
  extraPhone: any;
  email: any;
  address: any;
}

export interface IOrderLatestUpdatePlace {
  placeId: any;
  placeType: number;
  placeName: string;
  reservedFrom: any;
  reservedTo: any;
  durationMinutes: number;
}

export interface IOrderLatestUpdateItem {
  id: number;
  masterOrderDetailsId: number;
  menuItemId: number;
  mealId: any;
  name: string;
  qty: number;
  realQtyInMasterOrder: number;
  unitPrice: number;
  netUnitPrice: number;
  unitPriceWithTax: number;
  netUnitPriceWithTax: number;
  printer: IOrderLatestUpdatePrinter;
  modifiers: IOrderLatestUpdateModifier[];
}

export interface IOrderLatestUpdateModifier {
  id: number;
  name: string;
  qty: number;
  masterOrderDetailsId: number;
  realQtyInMasterOrder: number;
  unitPrice: number;
  netUnitPrice: number;
  unitPriceWithTax: number;
  netUnitPriceWithTax: number;
  printer: IOrderLatestUpdatePrinter;
}

export interface IOrderLatestUpdatePrinter {
  id: number;
  name: string;
  ipAddressOrMacAddress: string;
  port: number;
  comPort: string;
  type: number;
}

export interface IOrderLatestUpdateSummary {
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
}

export interface IOrderLatestUpdatePayments {
  payingCash: number;
  payingNetwork: number;
  remaining: number;
}

// refund read response


export interface IRefundResponse {
  id: number
  orderNumber: string
  orderMasterId: number
  paymentType: number
  dateTime: string
  orderType: number
  customer: IRefundCustomer
  place: IRefundPlace
  items: IRefundItem[]
  summary: IRefundSummary
  payments: IRefundPayments
}

export interface IRefundCustomer {
  id: number
  name: string
  phone: any
  extraPhone: any
  email: any
  address: any
}

export interface IRefundPlace {
  placeId: any
  placeType: number
  placeName: string
  reservedFrom: any
  reservedTo: any
  durationMinutes: number
}

export interface IRefundItem {
  id: number
  masterOrderDetailsId: number
  menuItemId: number
  mealId: any
  name: string
  qty: number
  realQtyInMasterOrder: number
  unitPrice: number
  netUnitPrice: number
  unitPriceWithTax: number
  netUnitPriceWithTax: number
  printer: any
  modifiers: any[]
}

export interface IRefundSummary {
  totalUnitPrice: number
  discountAmount: number
  discountPercentage: number
  serviceFeeType: number
  systemServiceFee: number
  systemVat: number
  totalSelectiveTax: number
  vatAmount: number
  serviceFee: number
  priceForPlace: number
  durationMinutes: number
  totalNet: number
  netReturnOrder: number
}

export interface IRefundPayments {
  payingCash: number
  payingNetwork: number
  remaining: number
}
