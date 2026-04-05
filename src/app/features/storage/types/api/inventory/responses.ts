export interface IInventoryProductSearchResponse {
  rows: IInventoryProductSearchRow[];
  paginationInfo: {
    currentPageIndex: number;
    totalRowsCount: number;
    totalPagesCount: number;
  };
}

export interface IInventoryProductSearchRow {
  id: number;
  itemId: number;
  itemName: string;
  quantity: number;
  unitId: number;
  unitName: string;
}

export interface IInventorySettlementSearchResponseValue {
  rows: IInventorySettlementSearchRow[];
  paginationInfo: {
    currentPageIndex: number;
    totalRowsCount: number;
    totalPagesCount: number;
  };
}
export interface IInventorySettlementSearchRow {
  id: number
  settlementNumber: string
  settlementDate: string
  referenceNumber: string
  itemsCount: number
}

export interface IInventoryReadResponse {
  id: number;
  settlementNumber: string;
  settlementDate: string;
  referenceNumber: string;
  createAt: string;
  items: IInventoryReadItem[];
}

export interface IInventoryReadItem {
  id: number;
  itemId: number;
  itemName: string;
  unitId: number;
  unitName: string;
  systemQuantity: number;
  actualQuantity: number;
  differenceQuantity: number;
}
