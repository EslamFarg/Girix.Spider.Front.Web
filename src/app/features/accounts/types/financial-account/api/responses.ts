import { BalanceNature, FinalAccountType } from '@/features/accounts/services/financial-account-service';

export interface ICashBankCustodyAccounts {
  cash: Omit<IFinancialAccountSearchRow, 'stage'>[];
  bank: Omit<IFinancialAccountSearchRow, 'stage'>[];
  custody: Omit<IFinancialAccountSearchRow, 'stage'>[];
}
export interface IFinancialAccountSearchRow {
  id: number;
  name: string;
  parentId: any;
  stage: number;
  finNumber: string;
  balanceNature: number;
  finalAccountType: FinancailAccountType;
  accountGroup: AccountGroup;
  accountStatus: AccountStatus;
}

enum FinancailAccountType {
  Normal = 1,
  Room = 2,
  Table = 3,
  Hut = 4,
  Delivery = 5,
  User = 6,
  Customer = 7,
}
enum AccountGroup {
  Assets = 1, // الأصول
  Liabilities = 2, // الخصوم
  Equity = 3, // حقوق الملكية
  Revenues = 4, // الإيرادات
  Expenses = 5, // المصروفات
}
enum AccountStatus {
  Active = 1, // نشط
  Inactive = 2, // غير نشط
  Closed = 3, // مغلق
}


export interface IFinancialAccountTreeRow {
  id: number;
  name: string;
  parentId: any;
  stage: number;
  finNumber: string;
  balanceNature: number;
  finalAccountType: FinancailAccountType;
  accountGroup: AccountGroup;
  accountStatus: AccountStatus;
  children: IFinancialAccountTreeRow[];
}

export type ITreeFinancialAccountSearchRow = IFinancialAccountSearchRow;

export interface IFinancialAccountTreeResponseValue {
  rows: IFinancialAccountTreeRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}
export interface IFinancialAccountSearchResponseValue {
  rows: IFinancialAccountSearchRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}

export interface ITreeFinancialAccountReadResponse {
  id: number;
  name: string;
  stage: number;
  parentId: number;
  finNumber: string;
  balanceNature: BalanceNature;
  finalAccountBalance: number;
  finalAccountType: FinalAccountType;
  accountGroup: AccountGroup;
  accountStatus: AccountStatus;
}
