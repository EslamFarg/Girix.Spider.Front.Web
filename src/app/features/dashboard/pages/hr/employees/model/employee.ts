export interface PaginationInfo {
  totalRowsCount: number;
  totalPagesCount: number;
}

export interface EmployeeModel {
  id: number;
  employeeNumber: string;
  baseNember: string;
  allowancesIds?: number[];
  allowancesNames?: string[];
  salary: number;
  departmentId: number;
  departmentName: string;
  nameAr: string;
  nameEn: string;
  name: string;
  phoneNember: string;
  imageUrl?: string;
  nationalIdOrIqamaNumber: string;
  nationalIdOrIqamaNumberUrl?: string;
  nationalIdOrIqamaNumberFile?: string;
  medicalInsuranceDate: string;
  medicalInsuranceFileUrl?: string;
  medicalInsuranceFile?: string;
  iban: string;
  bankAttachmentUrl?: string;
  bankAttachmentFile?: string;
  passportNumber?: string;
  passportAttachmentUrl?: string;
  passportAttachment?: string;
  borderNumber?: string;
  borderAttachmentUrl?: string;
  borderAttachment?: string;
  nationality: string;
  jobTitle: string;
  dateOfBirth: string;
  workStartDate: string;
  returnFromLeaveDate?: string;
  contractEndDate?: string;
  contractEndAttachmentUrl?: string;
  contractEndAttachmentFile?: string;
  address: string;
  accountId?: number;
}

export interface EmployeeSearchFilter {
  filter: {
    column: number;
    value: string;
  };
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
}

export interface EmployeeListData {
  rows: EmployeeModel[];
  paginationInfo: PaginationInfo;
}

export interface EmployeeListResponse {
  isSuccess: boolean;
  data: EmployeeListData;
}

export interface EmployeeByIdResponse {
  isSuccess: boolean;
  data: EmployeeModel;
}

export interface EmployeeMutationResponse {
  isSuccess: boolean;
  data: number;
}

export interface DepartmentOption {
  id: number;
  name: string;
  nameAr?: string;
  nameEn?: string;
}

export interface AllowanceOption {
  id: number;
  name: string;
  nameAr?: string;
  nameEn?: string;
}
