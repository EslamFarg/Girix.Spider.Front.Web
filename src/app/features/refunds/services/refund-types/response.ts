export interface IRefundSearchRow {
   id: number
  orderMasterId: number
  orderReturnDate: string
  netOrderReturn: number
  payingCash: number
  payingNetwork: number
  createdAt: string
  paymentType: number
  customerName: string
  customerPhone: any
  customerAdress: any
}
export interface IRefundSearchResponseValue {
  rows: IRefundSearchRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}
