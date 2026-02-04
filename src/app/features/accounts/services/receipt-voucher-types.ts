export interface IReceiptVoucherGetListRequest {
  paymentVoucherId: number;
  criteria: {
    paginationInfo: {
      pageIndex: number;
      pageSize: number;
    };
  };
}
export interface IReceiptVoucherGetListResponse {
  rows: IReceiptVoucherCollectiveReceiptGetListRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
  };
}

export interface IReceiptVoucherCollectiveReceiptGetListRow {
  id: number;
  voucherNo: string;
  voucherDate: string;
  creditAccountId: number;
  creditAccountName: string;
  totalAmount: number;
  payee: string;
}
