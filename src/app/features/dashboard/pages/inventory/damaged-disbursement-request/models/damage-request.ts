export interface PaginationInfo {
  totalRowsCount: number;
  totalPagesCount?: number;
}

export interface DamageRequestDetailModel {
  id?: number;
  productId?: number;
  productCode?: string;
  code?: string;
  productName?: string;
  itemName?: string;
  unitId?: number;
  unitName?: string;
  unit?: string;
  quantity?: number;
  qty?: number;
  returnedQuantity?: number;
  returnedQty?: number;
  damageValue?: number;
  notes?: string;
}

export interface DamageRequestModel {
  id: number;
  requestNo?: number | string;
  proofNumber?: string;
  reference?: string;
  referenceNo?: string;
  requestDate?: string;
  date?: string;
  warehouseId?: number;
  warehouseName?: string;
  store?: string;
  employeeId?: number;
  employeeName?: string;
  employee?: string;
  total?: number;
  notes?: string;
  status?: number | string;
  printCount?: number;
  editCount?: number;
  details?: DamageRequestDetailModel[];
  damageRequestDetails?: DamageRequestDetailModel[];
}

export interface DamageRequestDetailPayload {
  productId?: number;
  unitId?: number;
  quantity: number;
  returnedQuantity?: number;
  damageValue?: number;
  notes?: string;
}

export interface DamageRequestCreateModel {
  requestNo?: number | string;
  reference?: string;
  requestDate: string;
  warehouseId: number;
  notes?: string;
  details?: DamageRequestDetailPayload[];
}

export interface DamageRequestUpdateModel extends DamageRequestCreateModel {
  id: number;
}

export interface DamageRequestSearchModel {
  filter: {
    column: number;
    value: string;
  };
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
}

export interface DamageRequestListData {
  rows: DamageRequestModel[];
  paginationInfo: PaginationInfo;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
}

export interface DamageRequestListResponse extends ApiResponse<DamageRequestListData> {}

export interface DamageRequestByIdResponse extends ApiResponse<DamageRequestModel> {}

export interface DamageRequestMutationResponse extends ApiResponse<number> {}

export interface DamageRequestNextNoResponse extends ApiResponse<number | string> {}

export interface WarehouseOption {
  id: number;
  name: string;
}
