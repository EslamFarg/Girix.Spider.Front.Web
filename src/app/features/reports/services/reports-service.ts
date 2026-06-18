import { Injectable } from '@angular/core';
import BaseService from '@/core/services/BaseService';
import {
  IPaginatedReportResponse,
  IReportSearchCriteria,
  IInventoryByItemRow,
  IInventoryByPropertyRow,
  IItemMovementRow,
  IInventoryValueByItemRow,
  IInventoryValueByGroupRow,
  IReorderLimitRow,
  IPurchaseReportRow,
  IPurchaseItemDetailRow,
  IPurchaseReturnReportRow,
  IPurchaseReturnItemDetailRow,
  ISupplierAnalysisRow,
  ISalesReportRow,
  ISalesItemDetailRow,
  ISalesReturnReportRow,
  ISalesReturnItemDetailRow,
  ISalesCustomerRow,
  ISalesCashierRow,
  ISalesDeliveryRow,
  IAccountStatementRow,
  IAccountBalanceRow,
  IAccountMovementRow,
  IVoucherReportRow,
  IGeneralJournalRow,
  ISingleItemProfitRow,
  ITrialBalanceRow,
  IGroupedTrialBalanceRow,
  IAccountGroupBalanceRow,
  IGeneralLedgerRow,
  IIncomeStatementRow,
  ICustomersReportRow,
  ISuppliersReportRow,
  IDailyTransactionRow,
  IMiniDailyJournalRow,
  IDailySalesMovementRow,
  IVatReportRow,
  ISelectiveTaxReportRow,
} from '../types/api/reports-types';

@Injectable({ providedIn: 'root' })
export class ReportsService extends BaseService {
  override apiRoute = 'Reports';

  // ── Inventory ───────────────────────────────────────────────────────────────
  // TODO: confirm exact endpoint names with backend team

  getInventoryByItems(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IInventoryByItemRow>>(
      `${this.apiUrl}/InventoryByItems`,
      criteria,
    );
  }

  getInventoryByProperties(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IInventoryByPropertyRow>>(
      `${this.apiUrl}/InventoryValueByCategories`,
      criteria,
    );
  }

  getItemMovementFull(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IItemMovementRow>>(
      `${this.apiUrl}/ItemMovementFull`,
      criteria,
    );
  }

  getItemMovementActual(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IItemMovementRow>>(
      `${this.apiUrl}/ItemMovementActual`,
      criteria,
    );
  }

  getInventoryValueByItems(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IInventoryValueByItemRow>>(
      `${this.apiUrl}/InventoryValueByItems`,
      criteria,
    );
  }

  getInventoryValueByGroups(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IInventoryValueByGroupRow>>(
      `${this.apiUrl}/InventoryValueByCategories`,
      criteria,
    );
  }

  getReorderLimitByWarehouse(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IReorderLimitRow>>(
      `${this.apiUrl}/InventoryReorderLimitByWarehouse`,
      criteria,
    );
  }

  // ── Purchases ───────────────────────────────────────────────────────────────

  getPurchasesList(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IPurchaseReportRow>>(
      `${this.apiUrl}/PurchasesList`,
      criteria,
    );
  }

  getPurchasesItemsDetails(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IPurchaseItemDetailRow>>(
      `${this.apiUrl}/PurchaseItemsDetails`,
      criteria,
    );
  }

  getPurchaseReturnsList(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IPurchaseReturnReportRow>>(
      `${this.apiUrl}/PurchaseReturnsList`,
      criteria,
    );
  }

  getPurchaseReturnsItemsDetails(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IPurchaseReturnItemDetailRow>>(
      `${this.apiUrl}/PurchaseReturnItemsDetails`,
      criteria,
    );
  }

  getSuppliersAnalysis(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<ISupplierAnalysisRow>>(
      `${this.apiUrl}/PurchasesSuppliersAnalysis`,
      criteria,
    );
  }

  // ── Sales ───────────────────────────────────────────────────────────────────

  getSalesList(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<ISalesReportRow>>(
      `${this.apiUrl}/SalesList`,
      criteria,
    );
  }

  getSalesItemsDetails(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<ISalesItemDetailRow>>(
      `${this.apiUrl}/SalesItemsDetails`,
      criteria,
    );
  }

  getSalesReturnsList(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<ISalesReturnReportRow>>(
      `${this.apiUrl}/SalesReturnsList`,
      criteria,
    );
  }

  getSalesReturnsItemsDetails(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<ISalesReturnItemDetailRow>>(
      `${this.apiUrl}/SalesReturnItemsDetails`,
      criteria,
    );
  }

  getSalesEmployees(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<ISalesCustomerRow>>(
      `${this.apiUrl}/EmployeeSales`,
      criteria,
    );
  }

  getSalesCashiers(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<ISalesCashierRow>>(
      `${this.apiUrl}/MiniSalesItems`,
      criteria,
    );
  }

  getSalesDelivery(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<ISalesDeliveryRow>>(
      `${this.apiUrl}/SalesInvoicesProfit`,
      criteria,
    );
  }

  // ── Accounts ────────────────────────────────────────────────────────────────

  getSupplierStatement(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IAccountStatementRow>>(
      `${this.apiUrl}/SupplierAccountStatement`,
      criteria,
    );
  }

  getCustomerStatement(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IAccountStatementRow>>(
      `${this.apiUrl}/CustomerAccountStatement`,
      criteria,
    );
  }

  getFinancialStatement(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IAccountStatementRow>>(
      `${this.apiUrl}/SalesItemsProfit`,
      criteria,
    );
  }
  getCategoryProfit(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<any>>(
      `${this.apiUrl}/CategoryProfit`,
      criteria,
    );
  }

  getAccountBalances(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IAccountBalanceRow>>(
      `${this.apiUrl}/BalanceSheet`,
      criteria,
    );
  }

  getAccountMovement(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IAccountMovementRow>>(
      `${this.apiUrl}/AccountMovement`,
      criteria,
    );
  }

  getReceiptVouchers(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IVoucherReportRow>>(
      `${this.apiUrl}/ReceiptVouchersReport`,
      criteria,
    );
  }

  getPaymentVouchers(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IVoucherReportRow>>(
      `${this.apiUrl}/PaymentVouchersReport`,
      criteria,
    );
  }

  getGeneralJournal(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IGeneralJournalRow>>(
      `${this.apiUrl}/GeneralJournal`,
      criteria,
    );
  }

  getSingleItemProfit(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<ISingleItemProfitRow>>(
      `${this.apiUrl}/SingleItemProfit`,
      criteria,
    );
  }

  getTrialBalance(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<ITrialBalanceRow>>(
      `${this.apiUrl}/TrialBalance`,
      criteria,
    );
  }

  getGroupedTrialBalance(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IGroupedTrialBalanceRow>>(
      `${this.apiUrl}/GroupedTrialBalance`,
      criteria,
    );
  }

  getAccountGroupBalance(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IAccountGroupBalanceRow>>(
      `${this.apiUrl}/AccountGroupBalance`,
      criteria,
    );
  }

  getGeneralLedger(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IGeneralLedgerRow>>(
      `${this.apiUrl}/GeneralLedger`,
      criteria,
    );
  }

  getAccountStatement(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IAccountStatementRow>>(
      `${this.apiUrl}/AccountStatement`,
      criteria,
    );
  }

  getBalanceSheet(criteria: any) {
    return this.http.post<IPaginatedReportResponse<IAccountBalanceRow>>(
      `${this.apiUrl}/BalanceSheet`,
      criteria,
    );
  }

  getIncomeStatement(criteria: IReportSearchCriteria) {
    return this.http.post<any>(
      `${this.apiUrl}/IncomeStatement`,
      criteria,
    );
  }

  getCustomersReport(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<ICustomersReportRow>>(
      `${this.apiUrl}/Customers`,
      criteria,
    );
  }

  getSuppliersReport(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<ISuppliersReportRow>>(
      `${this.apiUrl}/Suppliers`,
      criteria,
    );
  }

  getDailyTransaction(criteria: IReportSearchCriteria) {
    return this.http.post<any>(
      `${this.apiUrl}/DailyTransaction`,
      criteria,
    );
  }

  getMiniDailyJournal(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IMiniDailyJournalRow>>(
      `${this.apiUrl}/MiniDailyJournal`,
      criteria,
    );
  }

  getDailySalesMovement(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IDailySalesMovementRow>>(
      `${this.apiUrl}/DailySalesMovement`,
      criteria,
    );
  }

  getVatReport(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<IVatReportRow>>(
      `${this.apiUrl}/Vat`,
      criteria,
    );
  }

  getSelectiveTaxReport(criteria: IReportSearchCriteria) {
    return this.http.post<IPaginatedReportResponse<ISelectiveTaxReportRow>>(
      `${this.apiUrl}/SelectiveTax`,
      criteria,
    );
  }
}
