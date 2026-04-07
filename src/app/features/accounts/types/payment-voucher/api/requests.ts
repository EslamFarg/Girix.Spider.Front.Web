export interface IPaymentVoucherCreateOrUpdateDetailsItem {
  finincalAccountId: number;
  isHasTax: boolean;
  totalAmount: number;
}
export interface IPaymentVoucherCreateRequest {
  voucherNo: string;
  voucherDate: string;
  notes: string;
  creditAccountId: number;
  isHasTax: boolean;
  totalAmount: number;
  payee: string;
  paymentVoucherDetailsRequestDtos: IPaymentVoucherCreateOrUpdateDetailsItem[];
}

export interface IPaymentVoucherUpdateRequest {
  id: number;
  voucherNo: string;
  voucherDate: string;
  notes: string;
  creditAccountId: number;
  isHasTax: boolean;
  totalAmount: number;
  payee: string;
  paymentVoucherDetailsRequestDtos: IPaymentVoucherCreateOrUpdateDetailsItem[];
}
