export interface FixedAccountRow {
  fixedAccountCode: number;
  nameAr: string;
  nameEn: string;
  accountId: number | null;
  counterpartName?: string | null;
}

export interface UpdateFixedAccountItem {
  fixedAccountCode: number;
  financialAccountId: number;
}

export interface FixedAccountListData {
  rows?: FixedAccountRow[];
  paginationInfo?: {
    totalRowsCount?: number;
    totalPagesCount?: number;
  };
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  message?: string;
}

export type FixedAccountListResponse = ApiResponse<
  FixedAccountListData | FixedAccountRow[]
>;
