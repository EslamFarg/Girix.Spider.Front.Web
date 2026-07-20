export interface TransferReceiveLineItem {
  productCode?: string;
  productName?: string;
  requestedUnitName?: string;
  requestedQuantity?: number;
  transferredQuantity?: number;
  transferredUnitName?: string;
}

export interface TransferReceiveReview {
  id?: number;
  transferRequestId?: number;
  code?: string;
  requestNo?: string | number;
  availableQuantity?: number | string;
  totalAvailableQuantity?: number | string;
  fromWarehouseName?: string;
  toWarehouseName?: string;
  date?: string;
  requestDate?: string;
  notes?: string;
  employeeName?: string;
  printCount?: number;
  editCount?: number;
  lines?: TransferReceiveLineDetail[];
  transferRequestLines?: TransferReceiveLineDetail[];
}

export interface TransferReceiveLineDetail {
  productCode?: string;
  code?: string;
  productName?: string;
  itemName?: string;
  unitName?: string;
  requestedUnitName?: string;
  requestedQuantity?: number;
  transferredQuantity?: number;
  approvedQuantity?: number;
  dispensedQuantity?: number;
  transferredUnitName?: string;
  approvedUnitName?: string;
}

export interface RejectTransferReceiptPayload {
  id: number;
  rejectionReasons?: string[];
  otherReason?: string | null;
}
