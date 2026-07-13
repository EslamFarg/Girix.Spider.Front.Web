export interface PaginationInfo {
  totalRowsCount: number;
  totalPagesCount: number;
}

export interface CustodyReceiptModel {
  id: number;
  employeeId?: number;
  employeeNumber?: string;
  employeeName?: string;
  name?: string;
  phoneNumber?: string;
  employeePhoneNum?: string;
  departmentName?: string;
  nationality?: string;
  baseSalary?: number;
  salary?: number;
  custodyName?: string;
  custodyTypeName?: string;
  additionType?: string;
  amount?: number;
  receiptDate?: string;
  date?: string;
  description?: string;
}

export interface CustodyReceiptDetailModel extends CustodyReceiptModel {
  employeeId: number;
  nationalIdOrIqamaNumber?: string;
  gender?: string;
  custodyId?: number;
}

export interface CustodyReceiptCreateModel {
  employeeId: number;
  custodyId: number;
  amount: number;
  receiptDate: string;
}

export interface CustodyReceiptUpdateModel extends CustodyReceiptCreateModel {
  id: number;
}

export interface CustodyReceiptSearchModel {
  filter: {
    column: number;
    value: string;
  };
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
}

export interface CustodyReceiptListData {
  rows: CustodyReceiptModel[];
  paginationInfo: PaginationInfo;
}

export interface CustodyReceiptListResponse {
  isSuccess: boolean;
  data: CustodyReceiptListData;
}

export interface CustodyReceiptByIdResponse {
  isSuccess: boolean;
  data: CustodyReceiptDetailModel;
}

export interface CustodyReceiptMutationResponse {
  isSuccess: boolean;
  data: number;
}
