import { EmployeeAdditionsTypes } from '../../../../../../shared/Enums/enumEmployee.enum';

export interface PayrollAdjustmentModel {
  id: number;
  employeeId: number;
  type?: EmployeeAdditionsTypes | number;
  adjustmentType?: EmployeeAdditionsTypes | number;
  amount?: number;
  // date?: string;
  adjustmentDate?: Date;
  // adjustmentDate?: string;
}

export interface PayrollAdjustmentCreateModel {
  employeeId: number;
  type: EmployeeAdditionsTypes | number;
  amount: number;
  date: string;
}

export interface PayrollAdjustmentUpdateModel extends PayrollAdjustmentCreateModel {
  id: number;
}

export interface PayrollAdjustmentListResponse {
  isSuccess: boolean;
  data: PayrollAdjustmentModel[] | { rows: PayrollAdjustmentModel[] };
}

export interface PayrollAdjustmentMutationResponse {
  isSuccess: boolean;
  data: number;
}
