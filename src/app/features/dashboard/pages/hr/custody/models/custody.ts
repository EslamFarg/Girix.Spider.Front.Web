export interface PaginationInfo {
  totalRowsCount: number;
  totalPagesCount: number;
}

export interface CustodyModel {
  id: number;
  employeeId?: number;
  employeeNumber?: string;
  employeeName?: string;
  name?: string;
  phoneNumber?: string;
  departmentName?: string;
  nationality?: string;
  baseSalary?: number;
  salary?: number;
  custodyName?: string;
  custodyTypeName?: string;
  additionType?: string;
  amount?: number;
  date?: string;
  description?: string;
}

export interface CustodyDetailModel extends CustodyModel {
  employeeId: number;
  nationalIdOrIqamaNumber?: string;
  gender?: string;
  custodyId?: number;
}

export interface CustodyCreateModel {
  employeeId: number;
  custodyId: number;
  amount: number;
  date: string;
}

export interface CustodyUpdateModel extends CustodyCreateModel {
  id: number;
}

export interface CustodySearchModel {
  filter: {
    column: number;
    value: string;
  };
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
}

export interface AssignCustodyToEmployeeModel {
  id: number;
  employeeId: number;
}

export interface CustodyListData {
  rows: CustodyModel[];
  paginationInfo: PaginationInfo;
}

export interface CustodyListResponse {
  isSuccess: boolean;
  data: CustodyListData;
}

export interface CustodyByIdResponse {
  isSuccess: boolean;
  data: CustodyDetailModel;
}

export interface CustodyMutationResponse {
  isSuccess: boolean;
  data: number;
}

export interface CustodyDropdownItem {
  id: number;
  name: string;
}
