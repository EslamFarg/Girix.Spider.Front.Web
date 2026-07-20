export interface GroupModel {
  id: number;
  name?: string;
  branchId?: number;
  branchName?: string;
  salePriceType?: number;
  showWholesalePrice?: boolean;
  showProfitPrice?: boolean;
  showSuperWholesalePrice?: boolean;
  showAverageCostPrice?: boolean;
  showPurchasePrice?: boolean;
  allowSellingBelowAvailable?: boolean;
}

export interface CreateGroupPayload {
  name?: string | null;
  branchId?: number | null;
  salePriceType?: number;
  showWholesalePrice?: boolean;
  showProfitPrice?: boolean;
  showSuperWholesalePrice?: boolean;
  showAverageCostPrice?: boolean;
  showPurchasePrice?: boolean;
  allowSellingBelowAvailable?: boolean;
}

export interface UpdateGroupPayload extends CreateGroupPayload {
  id: number;
}
