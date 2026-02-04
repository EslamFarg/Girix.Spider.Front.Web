export interface IUserCreateRequest {
  nameAr: string
  nameEn: string
  email: string
  phoneNumber: string
  groupId: number
  cashierCollectionAccountId: number
  custodyAccountId: number
  cashPaymentAccountId: number
  bankPaymentAccountId: number
}
export interface IUserCreateUpdateRequest {
  nameAr: string
  nameEn: string
  email: string
  phoneNumber: string
  groupId: number
  cashierCollectionAccountId: number
  custodyAccountId: number
  cashPaymentAccountId: number
  bankPaymentAccountId: number
}


export interface IUserRowResponse {
  userId: number;
  name: string;
  email: string;
  phoneNumber: string;
  groupId: number;
}

export interface IUserSearchResponseValue {
  rows: IUserRowResponse[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}


export interface IUserReadResponse {
  userId: number
  name: string
  email: string
  phoneNumber: string
  cashierCollectionAccountId: number
  custodyAccountId: number
  cashPaymentAccountId: number
  bankPaymentAccountId: number
  groupId: number
}