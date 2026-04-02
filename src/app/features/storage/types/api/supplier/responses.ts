export interface ISupplierSearchRow {
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
  commercialRegister: string;
  taxNumber: string;
  numberOfFloor: number;
  financiallyAccountId: number;
}
export interface ISupplierSearchResponseValue {
  rows: ISupplierSearchRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}

export interface ISupplierReadResponse {
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
  commercialRegister: string;
  taxNumber: string;
  numberOfFloor: number;
  financiallyAccountId: number;
}
