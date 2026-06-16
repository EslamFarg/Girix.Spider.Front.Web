export interface IReceiptVoucherSearchRow {
  id: number;
  voucherNo: string;
  voucherDate: string;
  debitAccountId: number;
  debitAccountName: string | null;
  totalAmount: number;
  /** Voucher-level notes — present once backend includes it in the search response */
  notes?: string | null;
}

export interface IReceiptVoucherSearchResponse {
  rows: IReceiptVoucherSearchRow[];
  paginationInfo: {
    currentPageIndex: number;
    totalRowsCount: number;
    totalPagesCount: number;
  };
}

export interface IReceiptVoucherReadResponse {
  id: number;
  voucherNo: string;
  voucherDate: string;
  paymentMethod: string;
  notes: string;
  debitAccountId: number;
  debitAccountName: string;
  isHasTax: boolean;
  totalAmount: number;
  lines: Array<{
    finincalAccountId: number;
    finincalAccountName: string;
    isHasTax: boolean;
    totalAmount: number;
  }>;
}
