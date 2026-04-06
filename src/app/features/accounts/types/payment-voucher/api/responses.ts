export interface IPaymentVoucherGetListRequest {
  paymentVoucherId: number;
  criteria: {
    paginationInfo: {
      pageIndex: number;
      pageSize: number;
    };
  };
}
export interface IPaymentVoucherGetListResponse {
  rows: IPaymentVoucherGetListRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
  };
}

export interface IPaymentVoucherGetListRow {
  id: number;
  voucherNo: string;
  voucherDate: string;
  creditAccountId: number;
  creditAccountName: string;
  totalAmount: number;
  payee: string;
}


