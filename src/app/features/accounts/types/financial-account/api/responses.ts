import { BalanceNature, FinalAccountType } from '@/features/accounts/services/financial-account-service';

export interface ICashBankCustodyAccounts {
  cash: ICashFinancialAccount[];
  bank: IBankFinancialAccount[];
  custody: ICustodyFinancialAccount[];
}

export interface ICashFinancialAccount {
  id: number;
  name: string;
  parentId: number;
  parentName: any;
  finNumber: string;
  balanceNature: number;
  finalAccountType: FinancailAccountType;
  accountGroup: AccountGroup;
  accountStatus: AccountStatus;
}

export interface IBankFinancialAccount {
  id: number;
  name: string;
  parentId: number;
  parentName: any;
  finNumber: string;
  balanceNature: number;
  finalAccountType: FinancailAccountType;
  accountGroup: AccountGroup;
  accountStatus: AccountStatus;
}

export interface ICustodyFinancialAccount {
  id: number;
  name: string;
  parentId: number;
  parentName: any;
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

export interface ITreeFinancialAccountSearchRow {
  id: number;
  name: string;
  parentId: any;
  stage: number;
  finNumber: string;
  balanceNature: number;
  finalAccountType: FinancailAccountType;
  accountGroup: AccountGroup;
  accountStatus: AccountStatus;
  children: ITreeFinancialAccountSearchRow[];
}

export interface IFinancialAccountSearchResponseValue {
  rows: ITreeFinancialAccountSearchRow[];
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
