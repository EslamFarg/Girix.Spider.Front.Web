export interface ApiResponse<T> {
  isSuccess?: boolean;
  message?: string;
  data: T;
}

export interface PaginatedRows<T> {
  rows: T[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount?: number;
  };
}

export interface IssueOrderDetailDto {
  id?: number | null;
  productCardId: number;
  unitId: number;
  quantity: number;
  price?: number;
  discountPercent?: number;
  discountAmount?: number;
  taxAmount?: number;
  lineTotal?: number;
  notes?: string | null;
  productCode?: string;
  productName?: string;
  unitName?: string;
}

export interface CreateIssueOrderPayload {
  referenceNo?: string | null;
  invoiceDate: string | Date;
  warehouseId: number;
  customerId?: number | null;
  paymentMethodId: number;
  notes?: string | null;
  details: IssueOrderDetailDto[];
}

export interface UpdateIssueOrderPayload extends CreateIssueOrderPayload {
  id: number;
  details: IssueOrderDetailDto[];
}

export interface IssueOrderModel {
  id: number;
  invoiceNo?: string;
  referenceNo?: string;
  invoiceDate?: string;
  warehouseId?: number;
  warehouseName?: string;
  customerId?: number;
  customerName?: string;
  accountName?: string;
  paymentMethodId?: number;
  notes?: string;
  details?: IssueOrderDetailDto[];
  issueOrderDetails?: IssueOrderDetailDto[];
  printCount?: number;
  editCount?: number;
  status?: number;
}

export interface IssueOrderListItem {
  id: number;
  invoiceNo?: string;
  referenceNo?: string;
  invoiceDate?: string;
  warehouseId?: number;
  warehouseName?: string;
  customerId?: number;
  customerName?: string;
  accountName?: string;
}

export interface IssueOrderSearchQuery {
  filter?: {
    invoiceNo?: string;
    referenceNo?: string;
    warehouseId?: number | null;
    customerId?: number | null;
    fromDate?: string | null;
    toDate?: string | null;
    status?: number | null;
  };
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
}

export interface LookupItem {
  id: number;
  name: string;
}
