import { Route } from '@angular/router';
import { Customers } from '@/features/reports/pages/customers/customers';
// Inventory
import { InventoryByItems } from '@/features/reports/pages/inventory/by-items/by-items';
import { InventoryByProperties } from '@/features/reports/pages/inventory/by-properties/by-properties';
import { ItemMovementFull } from '@/features/reports/pages/inventory/item-movement-full/item-movement-full';
import { ItemMovementActual } from '@/features/reports/pages/inventory/item-movement-actual/item-movement-actual';
import { InventoryValueByItems } from '@/features/reports/pages/inventory/value-by-items/value-by-items';
import { InventoryValueByGroups } from '@/features/reports/pages/inventory/value-by-groups/value-by-groups';
import { ReorderLimitByWarehouse } from '@/features/reports/pages/inventory/reorder-limit-by-warehouse/reorder-limit-by-warehouse';
// Purchases
import { PurchasesListReport } from '@/features/reports/pages/purchases/list/purchases-list';
import { PurchasesItemsDetails } from '@/features/reports/pages/purchases/items-details/purchases-items-details';
import { SuppliersAnalysis } from '@/features/reports/pages/purchases/suppliers-analysis/suppliers-analysis';
// Purchase Returns
import { PurchaseReturnsListReport } from '@/features/reports/pages/purchase-returns/list/purchase-returns-list';
import { PurchaseReturnsItemsDetails } from '@/features/reports/pages/purchase-returns/items-details/purchase-returns-items-details';
// Sales
import { SalesListReport } from '@/features/reports/pages/sales/list/sales-list';
import { SalesItemsDetails } from '@/features/reports/pages/sales/items-details/sales-items-details';
import { SalesCustomers } from '@/features/reports/pages/sales/customers/sales-customers';
import { SalesCashiers } from '@/features/reports/pages/sales/cashiers/sales-cashiers';
import { SalesDelivery } from '@/features/reports/pages/sales/delivery/sales-delivery';
// Sales Returns
import { SalesReturnsListReport } from '@/features/reports/pages/sales-returns/list/sales-returns-list';
import { SalesReturnsItemsDetails } from '@/features/reports/pages/sales-returns/items-details/sales-returns-items-details';
// Accounts
import { SupplierStatement } from '@/features/reports/pages/accounts/supplier-statement/supplier-statement';
import { CustomerStatement } from '@/features/reports/pages/accounts/customer-statement/customer-statement';
import { FinancialStatement } from '@/features/reports/pages/accounts/financial-statement/financial-statement';
import { AccountBalances } from '@/features/reports/pages/accounts/balances/balances';
import { AccountMovement } from '@/features/reports/pages/accounts/movement/movement';
import { ReceiptVouchers } from '@/features/reports/pages/accounts/receipt-vouchers/receipt-vouchers';
import { PaymentVouchers } from '@/features/reports/pages/accounts/payment-vouchers/payment-vouchers';
import { GeneralJournalReport } from '@/features/reports/pages/accounts/general-journal/general-journal';

export default [
  { path: 'customers', component: Customers },

  // ── Inventory ───────────────────────────────────────────────────────────────
  { path: 'InventoryByItems', component: InventoryByItems },
  { path: 'InventoryByProperties', component: InventoryByProperties },
  { path: 'InventoryItemMovementFull', component: ItemMovementFull },
  { path: 'InventoryItemMovementActual', component: ItemMovementActual },
  { path: 'InventoryValueByItems', component: InventoryValueByItems },
  { path: 'InventoryValueByGroups', component: InventoryValueByGroups },
  { path: 'InventoryReorderLimitByWarehouse', component: ReorderLimitByWarehouse },

  // ── Purchases ───────────────────────────────────────────────────────────────
  { path: 'PurchasesList', component: PurchasesListReport },
  { path: 'PurchasesItemsDetails', component: PurchasesItemsDetails },
  { path: 'PurchasesSuppliersAnalysis', component: SuppliersAnalysis },

  // ── Purchase Returns ────────────────────────────────────────────────────────
  { path: 'PurchaseReturnsList', component: PurchaseReturnsListReport },
  { path: 'PurchaseReturnsItemsDetails', component: PurchaseReturnsItemsDetails },

  // ── Sales ───────────────────────────────────────────────────────────────────
  { path: 'SalesList', component: SalesListReport },
  { path: 'SalesItemsDetails', component: SalesItemsDetails },
  { path: 'SalesCustomers', component: SalesCustomers },
  { path: 'SalesCashiers', component: SalesCashiers },
  { path: 'SalesDelivery', component: SalesDelivery },

  // ── Sales Returns ───────────────────────────────────────────────────────────
  { path: 'SalesReturnsList', component: SalesReturnsListReport },
  { path: 'SalesReturnsItemsDetails', component: SalesReturnsItemsDetails },

  // ── Accounts ────────────────────────────────────────────────────────────────
  { path: 'SupplierStatement', component: SupplierStatement },
  { path: 'CustomerStatement', component: CustomerStatement },
  { path: 'FinancialStatement', component: FinancialStatement },
  { path: 'AccountBalances', component: AccountBalances },
  { path: 'AccountMovement', component: AccountMovement },
  { path: 'ReceiptVouchersReport', component: ReceiptVouchers },
  { path: 'PaymentVouchersReport', component: PaymentVouchers },
  { path: 'GeneralJournal', component: GeneralJournalReport },
] satisfies Route[];
