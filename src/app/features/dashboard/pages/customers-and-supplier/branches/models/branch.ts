export interface BranchModel {
  id: number;
  accountNumber?: string;
  accountCode?: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  phoneNumber?: string;
  address?: string;
  notes?: string;
}

export interface CreateBranchPayload {
  nameAr?: string | null;
  nameEn?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  notes?: string | null;
}

export interface UpdateBranchPayload extends CreateBranchPayload {
  id: number;
}
