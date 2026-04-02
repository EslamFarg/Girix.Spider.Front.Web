export interface IPurchaseReturnSearchRow {
  id: number
  returnNumber: string
  returnDate: string
  purchaseInvoiceNumber: string
  supplierName: string
  referenceNumber: string
  paymentType: number
  cashAmount: number
  networkAmount: number
  subTotal: number
  taxAmount: number
  totalAmount: number
}
export interface IPurchaseReturnSearchResponseValue {
  rows: IPurchaseReturnSearchRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}


export interface IPurchaseReturnReadResponse {
  id: number
  returnNumber: string
  returnDate: string
  purchaseInvoiceId: number
  purchaseInvoiceNumber: string
  supplierId: number
  supplierName: string
  supplierPhoneNumber: string
  supplierTaxNumber: string
  reason: string
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
  items: IPurchaseReturnReadItem[]
}

export interface IPurchaseReturnReadItem {
    id: number
  purchaseInvoiceItemId: number
  menuItemsId: number
  menuItemName: string
  unitId: number
  unitName: string
  quantity: number
  purchasePrice: number
  salePrice: number
  taxAmount: number
  lineTotal: number
}
