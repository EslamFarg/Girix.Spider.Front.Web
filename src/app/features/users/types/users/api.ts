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
  image?: File | null
}
export interface IUserCreateUpdateRequest {
  nameAr: string
  nameEn: string
  email: string
  image?: File | null
  phoneNumber: string
  groupId: number
  cashierCollectionAccountId: number
  custodyAccountId: number
  cashPaymentAccountId: number
  bankPaymentAccountId: number
}


export interface IUserRowResponse {
  userId: number
  name: string
  email: string
  phoneNumber: string
  imageUrl: any
  isActive: boolean
  cashierCollectionAccountId: number
  custodyAccountId: number
  cashPaymentAccountId: number
  bankPaymentAccountId: number
  groupId: number
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
  imageUrl: string | null
  cashierCollectionAccountId: number | null
  custodyAccountId: number | null
  cashPaymentAccountId: number | null
  bankPaymentAccountId: number | null
  groupId: number,
  isActive: boolean 
}