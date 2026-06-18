import { Route } from '@angular/router';
// Customers & Suppliers
import { CustomersReport } from '@/features/reports/pages/customers/customers';
import { SuppliersReport } from '@/features/reports/pages/suppliers/suppliers';
// Inventory
import { InventoryByItems } from '@/features/reports/pages/inventory/by-items/by-items';
import { InventoryByProperties } from '@/features/reports/pages/inventory/by-properties/by-properties';
import { InventoryItemMovementFull } from '@/features/reports/pages/inventory/item-movement-full/item-movement-full';
import { InventoryItemMovementActual } from '@/features/reports/pages/inventory/item-movement-actual/item-movement-actual';
import { InventoryValueByItems } from '@/features/reports/pages/inventory/value-by-items/value-by-items';
import { InventoryValueByGroups } from '@/features/reports/pages/inventory/value-by-groups/value-by-groups';
import { InventoryReorderLimitByWarehouse } from '@/features/reports/pages/inventory/reorder-limit-by-warehouse/reorder-limit-by-warehouse';
// Purchases
import { PurchasesListReport } from '@/features/reports/pages/purchases/list/purchases-list';
import { PurchasesItemsDetails } from '@/features/reports/pages/purchases/items-details/purchases-items-details';
import { PurchasesSuppliersAnalysis } from '@/features/reports/pages/purchases/suppliers-analysis/suppliers-analysis';
// Purchase Returns
import { PurchaseReturnsList } from '@/features/reports/pages/purchase-returns/list/purchase-returns-list';
import { PurchaseReturnsItemsDetails } from '@/features/reports/pages/purchase-returns/items-details/purchase-returns-items-details';
// Sales
import { SalesList } from '@/features/reports/pages/sales/list/sales-list';
import { SalesItemsDetails } from '@/features/reports/pages/sales/items-details/sales-items-details';
import { SalesCustomers } from '@/features/reports/pages/sales/customers/sales-customers';
import { SalesCashiers } from '@/features/reports/pages/sales/cashiers/sales-cashiers';
import { SalesDelivery } from '@/features/reports/pages/sales/delivery/sales-delivery';
// Sales Returns
import { SalesReturnsList } from '@/features/reports/pages/sales-returns/list/sales-returns-list';
import { SalesReturnsItemsDetails } from '@/features/reports/pages/sales-returns/items-details/sales-returns-items-details';
// Accounts
import { SupplierStatement } from '@/features/reports/pages/accounts/supplier-statement/supplier-statement';
import { CustomerStatement } from '@/features/reports/pages/accounts/customer-statement/customer-statement';
import { FinancialStatement } from '@/features/reports/pages/accounts/financial-statement/financial-statement';
import { AccountBalances } from '@/features/reports/pages/accounts/balances/balances';
import { AccountMovement } from '@/features/reports/pages/accounts/movement/movement';
import { ReceiptVouchersReport } from '@/features/reports/pages/accounts/receipt-vouchers/receipt-vouchers';
import { PaymentVouchersReport } from '@/features/reports/pages/accounts/payment-vouchers/payment-vouchers';
import { GeneralJournal } from '@/features/reports/pages/accounts/general-journal/general-journal';
import { CategoryProfit } from '@/features/reports/pages/accounts/category-profit/category-profit';
import { SingleItemProfit } from '@/features/reports/pages/accounts/single-item-profit/single-item-profit';
import { TrialBalance } from '@/features/reports/pages/accounts/trial-balance/trial-balance';
import { GroupedTrialBalance } from '@/features/reports/pages/accounts/grouped-trial-balance/grouped-trial-balance';
import { AccountGroupBalance } from '@/features/reports/pages/accounts/account-group-balance/account-group-balance';
import { GeneralLedger } from '@/features/reports/pages/accounts/general-ledger/general-ledger';
import { AccountStatement } from '@/features/reports/pages/accounts/account-statement/account-statement';
import { BalanceSheet } from '@/features/reports/pages/accounts/balance-sheet/balance-sheet';
import { IncomeStatement } from '@/features/reports/pages/accounts/income-statement/income-statement';
import { DailyTransaction } from '@/features/reports/pages/accounts/daily-transaction/daily-transaction';
import { MiniDailyJournal } from '@/features/reports/pages/accounts/mini-daily-journal/mini-daily-journal';
import { VatReport } from '@/features/reports/pages/accounts/vat/vat';
import { SelectiveTaxReport } from '@/features/reports/pages/accounts/selective-tax/selective-tax';
import { DailySalesMovement } from '@/features/reports/pages/sales/daily-sales-movement/daily-sales-movement';

export default [
  // ── Customers & Suppliers ───────────────────────────────────────────────────
  { path: 'Customers', component: CustomersReport },
  { path: 'Suppliers', component: SuppliersReport },

  // ── Inventory ───────────────────────────────────────────────────────────────
  { path: 'InventoryByItems', component: InventoryByItems },
  { path: 'InventoryByProperties', component: InventoryByProperties },
  { path: 'InventoryItemMovementFull', component: InventoryItemMovementFull },
  { path: 'InventoryItemMovementActual', component: InventoryItemMovementActual },
  { path: 'InventoryValueByItems', component: InventoryValueByItems },
  { path: 'InventoryValueByGroups', component: InventoryValueByGroups },
  { path: 'InventoryReorderLimitByWarehouse', component: InventoryReorderLimitByWarehouse },

  // ── Purchases ───────────────────────────────────────────────────────────────
  { path: 'PurchasesList', component: PurchasesListReport },
  { path: 'PurchasesItemsDetails', component: PurchasesItemsDetails },
  { path: 'PurchasesSuppliersAnalysis', component: PurchasesSuppliersAnalysis },

  // ── Purchase Returns ────────────────────────────────────────────────────────
  { path: 'PurchaseReturnsList', component: PurchaseReturnsList },
  { path: 'PurchaseReturnsItemsDetails', component: PurchaseReturnsItemsDetails },

  // ── Sales ───────────────────────────────────────────────────────────────────
  { path: 'SalesList', component: SalesList },
  { path: 'SalesItemsDetails', component: SalesItemsDetails },
  { path: 'SalesCustomers', component: SalesCustomers },
  { path: 'SalesCashiers', component: SalesCashiers },
  { path: 'SalesDelivery', component: SalesDelivery },

  // ── Sales Returns ───────────────────────────────────────────────────────────
  { path: 'SalesReturnsList', component: SalesReturnsList },
  { path: 'SalesReturnsItemsDetails', component: SalesReturnsItemsDetails },

  // ── Accounts ────────────────────────────────────────────────────────────────
  { path: 'SupplierStatement', component: SupplierStatement },
  { path: 'CustomerStatement', component: CustomerStatement },
  { path: 'FinancialStatement', component: FinancialStatement },
  { path: 'AccountBalances', component: AccountBalances },
  { path: 'AccountMovement', component: AccountMovement },
  { path: 'ReceiptVouchersReport', component: ReceiptVouchersReport },
  { path: 'PaymentVouchersReport', component: PaymentVouchersReport },
  { path: 'GeneralJournal', component: GeneralJournal },
  { path: 'CategoryProfit', component: CategoryProfit },

  // ── New Reports ─────────────────────────────────────────────────────────────
  { path: 'SingleItemProfit', component: SingleItemProfit },
  { path: 'TrialBalance', component: TrialBalance },
  { path: 'GroupedTrialBalance', component: GroupedTrialBalance },
  { path: 'AccountGroupBalance', component: AccountGroupBalance },
  { path: 'GeneralLedger', component: GeneralLedger },
  { path: 'AccountStatement', component: AccountStatement },
  { path: 'BalanceSheet', component: BalanceSheet },
  { path: 'IncomeStatement', component: IncomeStatement },
  { path: 'DailyTransaction', component: DailyTransaction },
  { path: 'MiniDailyJournal', component: MiniDailyJournal },
  { path: 'DailySalesMovement', component: DailySalesMovement },
  { path: 'Vat', component: VatReport },
  { path: 'SelectiveTax', component: SelectiveTaxReport },
] satisfies Route[];
