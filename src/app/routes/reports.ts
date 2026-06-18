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
  { path: 'inventory/by-items', component: InventoryByItems },
  { path: 'inventory/by-properties', component: InventoryByProperties },
  { path: 'inventory/item-movement-full', component: ItemMovementFull },
  { path: 'inventory/item-movement-actual', component: ItemMovementActual },
  { path: 'inventory/value-by-items', component: InventoryValueByItems },
  { path: 'inventory/value-by-groups', component: InventoryValueByGroups },
  { path: 'inventory/reorder-limit-by-warehouse', component: ReorderLimitByWarehouse },

  // ── Purchases ───────────────────────────────────────────────────────────────
  { path: 'purchases/list', component: PurchasesListReport },
  { path: 'purchases/items-details', component: PurchasesItemsDetails },
  { path: 'purchases/suppliers-analysis', component: SuppliersAnalysis },

  // ── Purchase Returns ────────────────────────────────────────────────────────
  { path: 'purchase-returns/list', component: PurchaseReturnsListReport },
  { path: 'purchase-returns/items-details', component: PurchaseReturnsItemsDetails },

  // ── Sales ───────────────────────────────────────────────────────────────────
  { path: 'sales/list', component: SalesListReport },
  { path: 'sales/items-details', component: SalesItemsDetails },
  { path: 'sales/customers', component: SalesCustomers },
  { path: 'sales/cashiers', component: SalesCashiers },
  { path: 'sales/delivery', component: SalesDelivery },

  // ── Sales Returns ───────────────────────────────────────────────────────────
  { path: 'sales-returns/list', component: SalesReturnsListReport },
  { path: 'sales-returns/items-details', component: SalesReturnsItemsDetails },

  // ── Accounts ────────────────────────────────────────────────────────────────
  { path: 'accounts/supplier-statement', component: SupplierStatement },
  { path: 'accounts/customer-statement', component: CustomerStatement },
  { path: 'accounts/financial-statement', component: FinancialStatement },
  { path: 'accounts/balances', component: AccountBalances },
  { path: 'accounts/movement', component: AccountMovement },
  { path: 'accounts/receipt-vouchers', component: ReceiptVouchers },
  { path: 'accounts/payment-vouchers', component: PaymentVouchers },
  { path: 'accounts/general-journal', component: GeneralJournalReport },
] satisfies Route[];
