export interface IOpeningBalanceReadResponse {
  id: number;
  invoiceNumber: string;
  referenceNumber: string;
  date: string;
  notes: string;
  totalAmount: number;
  items: IOpeningBalanceItem[];
}

export interface IOpeningBalanceItem {
  id: number;
  itemId: number;
  itemName: string;
  unitId: number;
  unitName: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  total: number;
}

export interface IOpeningBalanceSearchResponse {
  rows: IOpeningBalanceSearchRow[];
  paginationInfo: {
    currentPageIndex: number;
    totalRowsCount: number;
    totalPagesCount: number;
  };
}

export interface IOpeningBalanceSearchRow {
  id: number;
  invoiceNumber: string;
  referenceNumber: string;
  date: string;
  notes: string;
  totalAmount: number;
  itemsCount: number;
}
