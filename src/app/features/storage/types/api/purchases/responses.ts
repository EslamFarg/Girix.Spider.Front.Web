export interface IPurchaseSearchRow {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  supplierName: string;
  referenceNumber: string;
  paymentType: number;
  cashAmount: number;
  networkAmount: number;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
}
export interface IPurchaseSearchResponseValue {
  rows: IPurchaseSearchRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}


export interface IPurchaseReadResponse {
  id: number
  invoiceNumber: string
  invoiceDate: string
  supplierId: number
  supplierName: string
  supplierPhoneNumber: string
  supplierTaxNumber: string
  statement: string
  paymentType: number
  referenceNumber: string
  cashAmount: number
  networkAmount: number
  cashAccountId: number
  cashAccountName: string
  networkAccountId: number
  networkAccountName: string
  subTotal: number
  taxAmount: number
  totalAmount: number
  items: IPurchaseReadItem[]
}

export interface IPurchaseReadItem {
  id: number
  menuItemsId: number
  menuItemName: string
  unitId: number
  unitName: string
  quantity: number
  purchasePrice: number
  salePrice: number
  taxAmount: number
  lineTotal: number
  notes: string
}
