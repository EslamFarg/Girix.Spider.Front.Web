export interface PayrollEmployeeModel {
  employeeId: number;
  employeeNumber: string;
  employeeName: string;
  departmentId: number;
  departmentName: string;
  basicSalary: number;
  allowancesAmount: number;
  allowancesCount: number;
  bonusAmount: number;
  bonusCount: number;
  penaltyAmount: number;
  penaltyCount: number;
  advanceAmount: number;
  advanceCount: number;
  deductionAmount: number;
  deductionCount: number;
  overtimeAmount: number;
  overtimeCount: number;
  delayAmount: number;
  delayCount: number;
  absenceAmount: number;
  absenceCount: number;
  vacationAmount: number;
  vacationCount: number;
  netSalary: number;
}

export interface PayrollEmployeesQuery {
  month: string;
  year: string;
  departmentId?: number | null;
}

export interface PayrollEmployeesListResponse {
  isSuccess: boolean;
  data: PayrollEmployeeModel[] | { rows: PayrollEmployeeModel[] };
}

export interface SalaryPostingDetailModel {
  employeeId: number;
  employeeNumber?: string;
  employeeName?: string;
  departmentId?: number;
  departmentName?: string;
  basicSalary: number;
  allowancesAmount: number;
  allowancesCount: number;
  bonusAmount: number;
  bonusCount: number;
  penaltyAmount: number;
  penaltyCount: number;
  advanceAmount: number;
  advanceCount: number;
  deductionAmount: number;
  deductionCount: number;
  overtimeAmount: number;
  overtimeCount: number;
  delayAmount: number;
  delayCount: number;
  absenceAmount: number;
  absenceCount: number;
  vacationAmount: number;
  vacationCount: number;
  netSalary: number;
}

export interface CreateSalaryPostingModel {
  month: number;
  year: number;
  postingDate: string;
  notes?: string | null;
  details: SalaryPostingDetailModel[];
}

export interface UpdateSalaryPostingModel extends CreateSalaryPostingModel {
  id: number;
}

export interface SalaryPostingMutationResponse {
  isSuccess: boolean;
  data: number;
}

export interface PaginationInfo {
  totalRowsCount: number;
  totalPagesCount: number;
}

export interface SalaryPostingModel {
  id: number;
  postingNo?: string;
  postingNumber?: string;
  postingDate?: string;
  month?: number;
  year?: number;
  departmentId?: number;
  periodFrom?: string;
  periodTo?: string;
  status?: number;
  statusName?: string;
  notes?: string | null;
  totalNetSalary?: number;
  netSalary?: number;
  employeesCount?: number;
  details?: SalaryPostingDetailModel[];
}

export interface SalaryPostingListData {
  rows: SalaryPostingModel[];
  paginationInfo: PaginationInfo;
}

export interface SalaryPostingListResponse {
  isSuccess: boolean;
  data: SalaryPostingListData;
}

export interface SalaryPostingSearchFilter {
  fromDate?: string | null;
  toDate?: string | null;
  periodFrom?: string | null;
  periodTo?: string | null;
  postingNo?: string | null;
  status?: number | null;
}

export interface SalaryPostingSearchModel {
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  filter?: SalaryPostingSearchFilter;
}

export interface SalaryPostingByIdResponse {
  isSuccess: boolean;
  data: SalaryPostingModel;
}
