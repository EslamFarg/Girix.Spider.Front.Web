export interface ICustomerSearchRow {
  id: number;
  name: string;
  phoneNumber: string;
  secondaryMobileNumber: string;
  city: string;
  district: string;
  street: string;
  buildingNumber: string;
  apartment: string;
  landmark: string;
  postalCode: string;
  orderNumbers: number;
  isCompany: boolean;
  commercialRegister: any;
  taxNumber: any;
  numberOfFloor: any;
}

export interface ICustomerCreateRequest {
  nameAr: string;
  nameEn: string;
  phoneNumber: string;
  secondaryMobileNumber: string;
  city: string;
  district: string;
  street: string;
  buildingNumber: string;
  apartment: string;
  landmark: string;
  postalCode: string;
  commercialRegister: string;
  taxNumber: string;
  isCompany: boolean;
}

export interface ICustomerUpdateRequest {
  id: number;
  nameAr: string;
  nameEn: string;
  phoneNumber: string;
  secondaryMobileNumber: string;
  city: string;
  district: string;
  street: string;
  buildingNumber: string;
  apartment: string;
  landmark: string;
  postalCode: string;
  isCompany: boolean;
}

export interface ICustomerReadResponse {
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
  orderNumbers: number
  isCompany: boolean
  commercialRegister: any
  taxNumber: any
  numberOfFloor: any
}

export interface ICustomerSearchResponseValue {
  rows: ICustomerSearchRow[];
  paginationInfo: {
    currentPageIndex: number;
    totalRowsCount: number;
    totalPagesCount: number;
  };
}