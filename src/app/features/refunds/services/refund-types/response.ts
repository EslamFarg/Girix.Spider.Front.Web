export interface IRefundRowResponse {
  id: number;
  orderNumber: string;
  orderType: number;
  paymentType: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerSecondaryPhone: string;
  customerAdress: string;
  deliveryId: number;
  placeType: number;
  placeRefId: number;
  priceForPlace: number;
  createdAt: string;
  netOrder: number;
  isCollected: boolean;
  payingCash: number;
  payingNetwork: number;
}
export interface IRefundSearchResponseValue {
  rows: IRefundRowResponse[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}
