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
  finalAccountType: number;
  accountGroup: number;
  accountStatus: number;
}

export interface IBankFinancialAccount {
  id: number;
  name: string;
  parentId: number;
  parentName: any;
  finNumber: string;
  balanceNature: number;
  finalAccountType: number;
  accountGroup: number;
  accountStatus: number;
}

export interface ICustodyFinancialAccount {
  id: number;
  name: string;
  parentId: number;
  parentName: any;
  finNumber: string;
  balanceNature: number;
  finalAccountType: number;
  accountGroup: number;
  accountStatus: number;
}
