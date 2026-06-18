export interface IPaginatedReportResponse<T> {
  data: T[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
  };
}

export interface IReportSearchCriteria {
  fromDate?: string | null;
  toDate?: string | null;
  searchTerm?: string | null;
  pageIndex: number;
  pageSize: number;
  warehouseId?: number | null;
  itemId?: number | null;
  groupId?: number | null;
  supplierId?: number | null;
  customerId?: number | null;
  cashierId?: number | null;
  deliveryId?: number | null;
  accountId?: number | null;
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export interface IInventoryByItemRow {
  itemCode: string;
  itemName: string;
  unit: string;
  warehouseName: string;
  quantity: number;
}

export interface IInventoryByPropertyRow {
  itemName: string;
  propertyName: string;
  propertyValue: string;
  quantity: number;
  warehouseName: string;
}

export interface IItemMovementRow {
  itemName: string;
  movementType: string;
  referenceNumber: string;
  date: string;
  warehouseName: string;
  quantity: number;
}

export interface IInventoryValueByItemRow {
  itemCode: string;
  itemName: string;
  unit: string;
  quantity: number;
  costPrice: number;
  totalValue: number;
}

export interface IInventoryValueByGroupRow {
  groupName: string;
  itemsCount: number;
  totalValue: number;
}

export interface IReorderLimitRow {
  itemCode: string;
  itemName: string;
  warehouseName: string;
  currentQuantity: number;
  reorderLimit: number;
  shortage: number;
}

// ── Purchases ─────────────────────────────────────────────────────────────────

export interface IPurchaseReportRow {
  invoiceNumber: string;
  referenceNumber: string;
  date: string;
  supplierName: string;
  totalAmount: number;
  taxAmount: number;
  netAmount: number;
}

export interface IPurchaseItemDetailRow {
  invoiceNumber: string;
  date: string;
  supplierName: string;
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IPurchaseReturnReportRow {
  returnNumber: string;
  date: string;
  supplierName: string;
  totalAmount: number;
  notes: string;
}

export interface IPurchaseReturnItemDetailRow {
  returnNumber: string;
  date: string;
  supplierName: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ISupplierAnalysisRow {
  supplierName: string;
  invoicesCount: number;
  totalPurchases: number;
  totalReturns: number;
  netAmount: number;
}

// ── Sales ─────────────────────────────────────────────────────────────────────

export interface ISalesReportRow {
  invoiceNumber: string;
  date: string;
  customerName: string;
  totalAmount: number;
  taxAmount: number;
  netAmount: number;
}

export interface ISalesItemDetailRow {
  invoiceNumber: string;
  date: string;
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ISalesReturnReportRow {
  returnNumber: string;
  date: string;
  customerName: string;
  totalAmount: number;
}

export interface ISalesReturnItemDetailRow {
  returnNumber: string;
  date: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ISalesCustomerRow {
  customerName: string;
  invoicesCount: number;
  totalAmount: number;
  returnsAmount: number;
  netAmount: number;
}

export interface ISalesCashierRow {
  cashierName: string;
  invoicesCount: number;
  totalAmount: number;
  taxAmount: number;
  netAmount: number;
}

export interface ISalesDeliveryRow {
  deliveryName: string;
  ordersCount: number;
  totalAmount: number;
  netAmount: number;
}
export interface ICategoryProfitRow {
  deliveryName: string;
  ordersCount: number;
  totalAmount: number;
  netAmount: number;
}

// ── Accounts ──────────────────────────────────────────────────────────────────

export interface IAccountStatementRow {
  date: string;
  description: string;
  referenceNumber: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface IAccountBalanceRow {
  accountCode: string;
  accountName: string;
  debitBalance: number;
  creditBalance: number;
  netBalance: number;
}

export interface IAccountMovementRow {
  date: string;
  accountName: string;
  description: string;
  referenceNumber: string;
  debit: number;
  credit: number;
}

export interface IVoucherReportRow {
  voucherNumber: string;
  date: string;
  partyName: string;
  description: string;
  amount: number;
  paymentMethod: string;
}

export interface IGeneralJournalRow {
  journalNumber: string;
  date: string;
  description: string;
  accountName: string;
  debit: number;
  credit: number;
}

// ── New Reports ───────────────────────────────────────────────────────────────

export interface ISingleItemProfitRow {
  itemId: number;
  itemNameAr: string;
  totalSales: number;
  totalCost: number;
  profit: number;
}

export interface ITrialBalanceRow {
  accountCode: string;
  accountName: string;
  debitBalance: number;
  creditBalance: number;
}

export interface IGroupedTrialBalanceRow {
  groupName: string;
  accountCode: string;
  accountName: string;
  debitBalance: number;
  creditBalance: number;
}

export interface IAccountGroupBalanceRow {
  groupName: string;
  debitBalance: number;
  creditBalance: number;
  netBalance: number;
}

export interface IGeneralLedgerRow {
  date: string;
  accountCode: string;
  accountName: string;
  description: string;
  referenceNumber: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface IIncomeStatementRow {
  accountCode: string;
  accountName: string;
  amount: number;
}

export interface ICustomersReportRow {
  customerName: string;
  phoneNumber: string;
  address: string;
  balance: number;
}

export interface ISuppliersReportRow {
  supplierName: string;
  phoneNumber: string;
  address: string;
  balance: number;
}

export interface IDailyTransactionRow {
  date: string;
  description: string;
  referenceNumber: string;
  debit: number;
  credit: number;
}

export interface IMiniDailyJournalRow {
  journalNumber: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
}

export interface IDailySalesMovementRow {
  invoiceNumber: string;
  date: string;
  customerName: string;
  totalAmount: number;
  taxAmount: number;
  netAmount: number;
}

export interface IVatReportRow {
  invoiceNumber: string;
  date: string;
  partyName: string;
  taxableAmount: number;
  vatAmount: number;
}

export interface ISelectiveTaxReportRow {
  invoiceNumber: string;
  date: string;
  partyName: string;
  selectiveTaxAmount: number;
  tobaccoFeesAmount: number;
}
