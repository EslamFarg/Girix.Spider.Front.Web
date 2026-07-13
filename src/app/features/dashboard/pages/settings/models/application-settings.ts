export interface ApplicationSettingsModel {
  branchId: number;
  priceType: number;
  priceDisplayType: number;
  companyNameAr: string;
  companyNameEn: string;
  identityTypeId: number;
  identityNumber: string;
  taxNumber: string;
  additionalNumber: string;
  email: string;
  website: string;
  bankAccountNumber: string;
  currency: number;
  decimalPrice: number;
  decimalQuantity: number;
  purchaseStoreId: number;
  salesStoreId: number;
  reservationStoreId: number;
  costCenterId: number;
  enableStatistics: boolean;
  discountMethod: number;
  minimumSelectiveTax: number;
  customerSupplierDisplayType: boolean | number;
  balanceRate: number;
  printName: string;
  postalCode: string;
  city: string;
  district: string;
  country: string;
  street: string;
  addressDetails: string;
  buildingNumber: string;
  mobile: string;
  fax: string;
  phone: string;
  enableDiscounts: boolean;
  enableWeightedBalanceColor: boolean;
  enableExpiryAndBatch: boolean;
  repeatTaxNumber: boolean;
  enableArabicName: boolean;
  enableEnglishName: boolean;
  enablePrice: boolean;
  enableImage: boolean;
  printInCashier: boolean;
  printInvoice: boolean;
  printSalesReturns: boolean;
  printCollectionReceipt: boolean;
  saveInvoiceType: number;
  printType: number;
}

export interface ApplicationSettingsListData {
  rows?: ApplicationSettingsModel[];
  paginationInfo?: {
    totalRowsCount: number;
    totalPagesCount?: number;
  };
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
}

export type ApplicationSettingsListResponse = ApiResponse<
  ApplicationSettingsListData | ApplicationSettingsModel | ApplicationSettingsModel[]
>;

export type ApplicationSettingsByBranchResponse = ApiResponse<ApplicationSettingsModel>;

export type ApplicationSettingsMutationResponse = ApiResponse<boolean | number | ApplicationSettingsModel>;
