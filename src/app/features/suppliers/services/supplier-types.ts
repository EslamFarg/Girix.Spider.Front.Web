export interface ISupplierSearchRow {
    id: number
  name: string
  phoneNumber: string
  secondaryMobileNumber: string
  city: string
  district: string
  street: string
  buildingNumber: string
  apartment: string
  landmark: string
  postalCode: string
  commercialRegister: string
  taxNumber: string
  isCompany: any
  numberOfFloor: number
  financiallyAccountId: number
}

export interface ISupplierCreateRequest {
   nameAr: string
  nameEn: string
  phoneNumber: string
  secondaryMobileNumber: string
  city: string
  district: string
  street: string
  buildingNumber: string
  apartment: string
  landmark: string
  postalCode: string
  commercialRegister: string
  taxNumber: string
  isCompany: boolean
  numberOfFloor: number
}

export interface ISupplierUpdateRequest {
  id: number
  nameAr: string
  nameEn: string
  phoneNumber: string
  secondaryMobileNumber: string
  city: string
  district: string
  street: string
  buildingNumber: string
  apartment: string
  landmark: string
  postalCode: string
  commercialRegister: string
  taxNumber: string
  isCompany: boolean
  numberOfFloor: number
}

export interface ISupplierReadResponse {
  name: string
  phoneNumber: string
  secondaryMobileNumber: string
  city: string
  district: string
  street: string
  buildingNumber: string
  apartment: string
  landmark: string
  postalCode: string
  commercialRegister: string
  taxNumber: string
  isCompany: boolean
  numberOfFloor: number
  financiallyAccountId: number
}

export interface ISupplierSearchResponseValue {
  rows: ISupplierSearchRow[];
  paginationInfo: {
    currentPageIndex: number;
    totalRowsCount: number;
    totalPagesCount: number;
  };
}