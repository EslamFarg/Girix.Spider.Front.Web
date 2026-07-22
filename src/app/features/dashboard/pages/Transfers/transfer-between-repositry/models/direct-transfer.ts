export interface ApiResponse<T> {
  isSuccess?: boolean;
  data: T;
}

export interface DirectTransferLineDto {
  productId: number;
  productCardId: number;
  quantity: number;
}

export interface CreateDirectTransferPayload {
  code?: string | null;
  reference?: string | null;
  fromWarehouseId: number;
  toWarehouseId: number;
  notes?: string | null;
  lines?: DirectTransferLineDto[] | null;
}

export interface UpdateDirectTransferPayload extends CreateDirectTransferPayload {
  id: number;
}

export interface DirectTransferSearchQuery {
  code?: string | null;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
}

export interface DirectTransferListItem {
  id: number;
  code?: string;
  reference?: string;
  date?: string;
  transferDate?: string;
  createdDate?: string;
  fromWarehouseId?: number;
  fromWarehouseName?: string;
  toWarehouseId?: number;
  toWarehouseName?: string;
  employeeName?: string;
  notes?: string;
  totalQuantity?: number;
  lines?: { quantity?: number }[];
}

export interface DirectTransferPaginationInfo {
  totalRowsCount: number;
  totalPagesCount?: number;
}

export interface DirectTransferListData {
  rows: DirectTransferListItem[];
  paginationInfo: DirectTransferPaginationInfo;
}

export interface DirectTransferListResponse {
  data: DirectTransferListData;
}

export interface DirectTransferLineDetail {
  id?: number;
  productId?: number;
  productCardId?: number;
  quantity?: number;
  productCode?: string;
  code?: string;
  productName?: string;
  itemName?: string;
  unitId?: number;
  unitName?: string;
}

export interface DirectTransferById {
  id: number;
  code?: string;
  reference?: string;
  fromWarehouseId?: number;
  fromWarehouseName?: string;
  toWarehouseId?: number;
  toWarehouseName?: string;
  date?: string;
  transferDate?: string;
  createdDate?: string;
  notes?: string;
  employeeName?: string;
  printCount?: number;
  editCount?: number;
  lines?: DirectTransferLineDetail[];
  directTransferLines?: DirectTransferLineDetail[];
}
