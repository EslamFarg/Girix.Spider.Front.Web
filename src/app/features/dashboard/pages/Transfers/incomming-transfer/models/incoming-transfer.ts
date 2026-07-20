export interface IncomingTransferLineItem {
  lineId?: number;
  productCardId?: number | null;
  productCode?: string;
  productName?: string;
  requestedUnitName?: string;
  requestedQuantity?: number;
  transferredQuantity?: number;
  transferredUnitName?: string;
  availableUnits?: IncomingTransferUnitOption[];
}

export interface IncomingTransferUnitOption {
  id: number;
  name: string;
}

export interface SenderApproveLinePayload {
  lineId: number;
  productCardId: number;
  transferredQuantity: number;
}

export interface SenderApprovePayload {
  id: number;
  lines: SenderApproveLinePayload[];
}

export interface IncomingTransferView {
  // itemsCount: number;
  availableQuantity: string;
  employeeName: string;
  fromWarehouseName: string;
  requestDate: string;
  notes: string;
  printCount: number;
  editCount: number;
}

export interface IncomingTransferReview {
  transferRequestId?:any;
  id: number;
  employeeName?: string;
  toWarehouseName?: string;
  code?: string;
  requestNo?: string | number;
  availableQuantity?: number | string;
  totalAvailableQuantity?: number | string;
  fromWarehouseName?: string;
  date?: string;
  requestDate?: string;
  notes?: string;
  printCount?: number;
  editCount?: number;
  lines?: IncomingTransferLineDetail[];
  transferRequestLines?: IncomingTransferLineDetail[];
}

export interface IncomingTransferLineDetail {
  id?: number;
  lineId?: number;
  productCardId?: number;
  transferredProductCardId?: number;
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
  availableUnits?: IncomingTransferUnitOption[];
  units?: IncomingTransferUnitOption[];
}
