import { invoiceType, PaymentMethod } from '../../../../../../shared/Enums/invoice.enum';

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedRows<T> {
  rows: T[];
  paginationInfo: {
    totalRowsCount: number;
  };
}

export interface PurchaseDetailDto {
  productCartId: number | null;
  warehouseId: number;
  quantity: number;
  purchasesPrice: number;
  total?: number;
  vat: number;
  disCountPercentage: number;
  discountAmount: number;
  vatDiscount?: number;
  totalDiscount?: number;
  net: number;
}

export interface CreatePurchasePayload {
  refNum?: string | null;
  supplierPhone?: string | null;
  taxNumber?: string | null;
  supplierId: number;
  purchasesDate: string;
  notes?: string | null;
  orderPymentType: invoiceType;
  paymentMethod: PaymentMethod;
  vat?: number;
  expenses?: number | null;
  net: number;
  branchId?: number | null;
  paidCash?: number | null;
  paidCashAccountId?: number | null;
  networkPaid?: number | null;
  networkPaidAccountId?: number | null;
  purchaseDetails: PurchaseDetailDto[];
}

export interface UpdatePurchasePayload extends CreatePurchasePayload {
  id: number;
  totalPrice?: number;
  disCountPercentage?: number;
  discountAmount?: number;
  allDiscount?: number;
  vatDiscount?: number;
  totalDiscount?: number;
}

export interface PurchaseDetailResponse extends PurchaseDetailDto {
  productCode?: string;
  productName?: string;
  warehouseName?: string;
  unitName?: string;
  unitId?: number;
}

export interface PurchaseResponse {
  id: number;
  invoiceNumber?: number;
  refNum?: string;
  supplierPhone?: string;
  taxNumber?: string;
  supplierId: number;
  supplierName?: string;
  purchasesDate: string;
  notes?: string;
  orderPymentType: invoiceType;
  paymentMethod: PaymentMethod;
  vat?: number;
  expenses?: number;
  net: number;
  branchId?: number;
  branchName?: string;
  paidCash?: number;
  paidCashAccountId?: number;
  networkPaid?: number;
  networkPaidAccountId?: number;
  purchaseDetails: PurchaseDetailResponse[];
  printCount?: number;
  editCount?: number;
}

export interface PurchaseListItem {
  id: number;
  invoiceNumber?: number;
  purchasesDate?: string;
  branchName?: string;
  supplierName?: string;
  paymentMethod?: PaymentMethod | string;
  totalQuantity?: number;
  net?: number;
  date?: string;
  warehouse?: string;
  supplier?: string;
  totalAmount?: number;
  purchaseDetails?: PurchaseDetailResponse[];
}

export interface AccountLookupItem {
  id: number;
  name: string;
}

export interface ProductSearchItem {
  label: string;
  value: number;
}

export interface ProductUnitItem {
  id: number;
  name?: string;
  fromUnitName?: string;
  productCode?: string;
  productName?: string;
  price?: number;
  purchasePrice?: number;
  selected?: boolean;
  vat?: number;
  selectiveVat?: number;
  selectiveTaxRate?: number;
  productCart?: ProductUnitItem[];
}
