export interface IJournalEntryReadResponse {
  id: number;
  voucherNo: string;
  refNumber: any;
  voucherDate: string;
  paymentMethod: string;
  notes: string;
  isHasTax: boolean;
  totalAmount: number;
  totalDebit: number;
  totalCredit: number;
  debitLines: IDebitLine[];
  creditLines: ICreditLine[];
}

export interface IDebitLine {
  finincalAccountId: number;
  finincalAccountName: string;
  isHasTax: boolean;
  totalAmount: number;
  notes: string;
}

export interface ICreditLine {
  finincalAccountId: number;
  finincalAccountName: string;
  isHasTax: boolean;
  totalAmount: number;
  notes: string;
}

export interface IJournalEntrySearchResponse {
  rows: IJournalEntrySearchRow[]
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  }
}

export interface IJournalEntrySearchRow {
  id: number
  voucherNo: string
  refNumber: string
  voucherDate: string
  totalDebit: number
  totalCredit: number
  totalAmount: number
}
