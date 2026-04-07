export interface IPaymentVoucherSearchRow {
  id: number;
  voucherNo: string;
  voucherDate: string;
  creditAccountId: number;
  creditAccountName: string;
  totalAmount: number;
  payee: string;
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
  }>;
}
