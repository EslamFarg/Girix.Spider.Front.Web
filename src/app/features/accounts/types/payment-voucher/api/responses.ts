export interface IPaymentVoucherSearchRow {
  id: number;
  voucherNo: string;
  voucherDate: string;
  creditAccountId: number;
  creditAccountName: string | null;
  totalAmount: number;
  payee: string;
  notes?: string | null;
}

export interface IPaymentVoucherSearchResponse {
  rows: IPaymentVoucherSearchRow[];
  paginationInfo: {
    currentPageIndex: number;
    totalRowsCount: number;
    totalPagesCount: number;
  };
}

export interface IPaymentVoucherReadResponse {
  id: number;
  voucherNo: string;
  voucherDate: string;
  paymentMethod: string;
  notes: string;
  creditAccountId: number;
  creditAccountName: string;
  isHasTax: boolean;
  totalAmount: number;
  payee: string;
  lines: Array<{
    finincalAccountId: number;
    finincalAccountName: string;
    isHasTax: boolean;
    totalAmount: number;
    notes: string;
  }>;
}
