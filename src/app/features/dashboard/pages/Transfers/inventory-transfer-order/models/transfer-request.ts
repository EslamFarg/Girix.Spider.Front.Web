export interface ApiResponse<T> {
  isSuccess?: boolean;
  data: T;
}

export interface TransferProductSearchItem {
  id: number;
  name: string;
}

export interface TransferProductSearchOption {
  label: string;
  value: number;
}

export interface TransferProductUnit {
  id: number;
  productCardId?: number;
  unitId?: number;
  name?: string;
  unitName?: string;
  fromUnitName?: string;
  isDefault?: boolean;
  isDefaultSellingUnit?: boolean;
  selected?: boolean;
}

export interface TransferProductLookup {
  productId: number;
  productCode: string;
  productName: string;
  units: TransferProductUnit[];
}

export interface TransferRequestLineFormValue {
  productId: number | null;
  productCardId: number | null;
  requestedQuantity: number;
  code: string;
  itemName: string;
  unitId: number | null;
  units: TransferProductUnit[];
  nameSuggestions: TransferProductSearchItem[];
  loading: boolean;
  codeError: string;
}

export interface TransferRequestListItem {
  id: number;
  code?: string;
  requestNo?: string | number;
  reference?: string;
  date?: string;
  requestDate?: string;
  fromWarehouseId?: number;
  fromWarehouseName?: string;
  toWarehouseId?: number;
  toWarehouseName?: string;
  employeeName?: string;
  totalRequestedQuantity?: number;
  totalQuantity?: number;
  lines?: { requestedQuantity?: number }[];
  status?: string;
}

export interface TransferRequestPaginationInfo {
  totalRowsCount: number;
  totalPagesCount?: number;
}

export interface TransferRequestListData {
  rows: TransferRequestListItem[];
  paginationInfo: TransferRequestPaginationInfo;
}

export interface TransferRequestListResponse {
  data: TransferRequestListData;
}

export interface TransferRequestSearchQuery {
  code?: string | null;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
}

export interface TransferRequestLineDetail {
  id?: number;
  productId?: number;
  productCardId?: number;
  requestedQuantity?: number;
  productCode?: string;
  code?: string;
  productName?: string;
  itemName?: string;
  unitId?: number;
  unitName?: string;
}

export interface TransferRequestById {
  id: number;
  code?: string;
  requestNo?: string | number;
  reference?: string;
  fromWarehouseId?: number;
  fromWarehouseName?: string;
  toWarehouseId?: number;
  toWarehouseName?: string;
  date?: string;
  requestDate?: string;
  notes?: string;
  employeeName?: string;
  lines?: TransferRequestLineDetail[];
  transferRequestLines?: TransferRequestLineDetail[];
}

export interface TransferRequestByIdResponse {
  data: TransferRequestById;
}
