export interface IReceiptVoucherCreateOrUpdateDetailsItem {
  finincalAccountId: number;
  isHasTax: boolean;
  totalAmount: number;
}
export interface IReceiptVoucherCreateRequest {
  voucherNo: string;
  voucherDate: string;
  notes: string;
  debitAccountId: number;
  isHasTax: boolean;
  totalAmount: number;
  receiptVoucherDetailsRequestDtos: IReceiptVoucherCreateOrUpdateDetailsItem[];
}

export interface IReceiptVoucherUpdateRequest {
  id: number;
  voucherNo: string;
  voucherDate: string;
  notes: string;
  debitAccountId: number;
  isHasTax: boolean;
  totalAmount: number;
  receiptVoucherDetailsRequestDtos: IReceiptVoucherCreateOrUpdateDetailsItem[];
}
