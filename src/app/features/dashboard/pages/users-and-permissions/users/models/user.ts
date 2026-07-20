export interface UserModel {
  id: number | string;
  userName?: string;
  email?: string;
  phoneNumber?: string;
  fullName?: string;
  groupId?: number;
  groupName?: string;
  branchId?: number;
  branchName?: string;
  defaultCashBoxAccountId?: number;
  defaultCashBoxAccountName?: string;
  defaultBankAccountId?: number;
  defaultBankAccountName?: string;
  customerAccountId?: number;
  customerAccountName?: string;
  defaultPurchaseCashBoxAccountId?: number;
  defaultPurchaseCashBoxAccountName?: string;
  defaultWarehouseId?: number;
  defaultWarehouseName?: string;
  purchaseWarehouseId?: number;
  purchaseWarehouseName?: string;
  reservedWarehouseId?: number;
  reservedWarehouseName?: string;
  isActive?: boolean;
  sendElectronicInvoice?: boolean;
  notes?: string;
  imageUrl?: string;
}

export interface CreateUserPayload {
  userName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  password?: string | null;
  fullName?: string | null;
  groupId?: number | null;
  branchId?: number | null;
  defaultCashBoxAccountId?: number | null;
  defaultBankAccountId?: number | null;
  customerAccountId?: number | null;
  defaultPurchaseCashBoxAccountId?: number | null;
  defaultWarehouseId?: number | null;
  purchaseWarehouseId?: number | null;
  reservedWarehouseId?: number | null;
  isActive?: boolean;
  sendElectronicInvoice?: boolean;
  notes?: string | null;
}

export interface UpdateUserPayload extends Omit<CreateUserPayload, 'password'> {
  id: string | number;
}
