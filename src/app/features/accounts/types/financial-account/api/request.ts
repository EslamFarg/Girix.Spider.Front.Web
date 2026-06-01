import { AccountGroup, AccountStatus, BalanceNature, FinalAccountType } from "@/features/accounts/services/financial-account-service";

export interface IFinancialAccountCreateRequest {
  createFinancialAccountDto: {
    nameAr: string;
    nameEn: string;
    parentId: number;
    balanceNature: BalanceNature;
    finalAccountType: FinalAccountType;
    accountGroup: AccountGroup;
    accountStatus: AccountStatus;
  };
}
export interface IFinancialAccountUpdateRequest {
  updateFinancialAccountDto: {
    id: number;
    nameAr: string;
    nameEn: string;
    parentId: number;
    balanceNature: BalanceNature;
    finalAccountType: FinalAccountType;
    accountGroup: AccountGroup;
    accountStatus: AccountStatus;
  };
}
