import { Routes } from "@angular/router";
import { purchaseOrderRoute } from "./pages/purchases/purchase-order/purchase-order.route";
import { autometedPurchaseOrderRoute } from "./pages/purchases/autometed-purchase-order/autometed-purchase-order.route";
import { PurchaseInvoice } from "./pages/purchases/purchase-invoice/purchase-invoice";
import { PurchaseInvoiceRoute } from "./pages/purchases/purchase-invoice/purchase-invoice.route";
import { internationalPurchaseInvoiceRoute } from "./pages/purchases/international-purchase-invoice/international-purchase-invoice.route";
import { purchaseReturnsRoute } from "./pages/purchase-returns/purchase-returns/purchase-returns.routes";
import { purchaseReturnsWithoutInvoiceNumberRoute } from "./pages/purchase-returns/purchase-returns-without-invoice-number/purchase-returns-without-invoice-number.routes";
import { MultiplyPurchaseReturnsRoute } from "./pages/purchase-returns/multiply-purchase-returns/multiply-purchase-returns.routes";
import { PurchaseInvoiceDraft } from "./pages/purchase-returns/purchase-invoice-draft/purchase-invoice-draft.route";
import { displaySalesPrices } from "./pages/sales/display-sales-prices/display-sales-prices.route";
import { salesInvoiceRoute } from "./pages/sales/sales-invoice/sales-invoice.routes";
import { deliveryGoodsRoute } from "./pages/sales/delivery-goods/delivery-goods.routes";
import { disbursingReservationsRoute } from "./pages/sales/disbursing-reservations/disbursing-reservations.routes";
import { DepitNotificationRoutes } from "./pages/sales/depit-notification/depit-notification.routes";
import { salesReturnsPageRoutes } from "./pages/sales-returns/sales-returns/sales-returns-page.routes";
import { MultiplySalesReturns } from "./pages/sales-returns/multiply-sales-returns/multiply-sales-returns";
import { MultiplySalesReturnsRoutes } from "./pages/sales-returns/multiply-sales-returns/multiply-sales.routes";
import { draftSalesInvoiceRoute } from "./pages/sales-returns/draft-sales-invoice/draft-sales-invoice.routes";
import { PaymentVoucher } from "./pages/sales-returns/payment-voucher/payment-voucher";
import { paymentVoucherRoute } from "./pages/sales-returns/payment-voucher/payment-voucher.routes";
import { damagedDisbursementRequestRoutes } from "./pages/inventory/damaged-disbursement-request/damaged-disbursement-request.routes";
import { QuickSalesPointCashiersRoutes } from "./pages/sales/quick-sales-point-cashiers/quick-sales-point-cashiers.routes";
import { InventoryAdjustment } from "./pages/inventory/inventory-adjustment/inventory-adjustment";
import { InventoryAdjustmentRequestRoutes } from "./pages/inventory/inventory-adjustment-request/inventory-adjustment.route";
import { InventoryAdjustmentRoutes } from "./pages/inventory/inventory-adjustment/inventory-adjustment.route";
import { OpeningBalanceRoute } from "./pages/inventory/opening-balance/opening-balance.route";
import { SupplyOrderRoute } from "./pages/inventory/supply-order/supply-order.route";
import { ConjugationCommand } from "./pages/inventory/conjugation-command/conjugation-command";
import { ConjugationCommandRoute } from "./pages/inventory/conjugation-command/conjugation-command.route";
import { Scrap } from "./pages/inventory/scrap/scrap";
import { ScrapRoutes } from "./pages/inventory/scrap/scrap.route";
import { PeriodicInventoryWarehouseRoute } from "./pages/inventory/periodic-inventory-warehouse/periodic-inventory-warehouse.route";
import { InventoryTransferOrderRoute } from "./pages/Transfers/inventory-transfer-order/inventory-transfer-order.route";
import {IncommingTransferRoute } from "./pages/Transfers/incomming-transfer/incomming-transfer.route";
import { InventoryTransferReceiveRoute } from "./pages/Transfers/inventory-transfer-receive/inventory-transfer-receive.route";
import { internalExchangeRoute } from "./pages/Transfers/internal-exchange-permit/internal-exchange.route";
import { TransferBetweenRepositryRoute } from "./pages/Transfers/transfer-between-repositry/transfer-between-repositry.route";
import { OutgoingTransfer } from "./pages/cash-transfers/outgoing-transfer/outgoing-transfer";
import { OutgoingTranferRoute } from "./pages/cash-transfers/outgoing-transfer/outgoing-transfer.route";
import { OutgoingTranferApproveRoute } from "./pages/cash-transfers/outgoing-transfer-approve/outgoing-tranfer-approve.route";
import { IncommingCashTransferRoute } from "./pages/cash-transfers/incomming-cash-transfer/incomming-cash-transfer.route";
import { DepreciationRoute } from "./pages/cash-transfers/depreciations/depreciations.route";
import { CashTransferBetweenTwoBranchesRoute } from "./pages/cash-transfers/cash-transfer-between-two-branches/cash-transfer-between-two-branches.route";
import { QrcodePrinter } from "./pages/qr-code/qrcode-printer/qrcode-printer";
import { QrcodePrinterRoute } from "./pages/qr-code/qrcode-printer/qrcode-printer.route";
import { InstallmentProof } from "./pages/installment/installment-proof/installment-proof";
import { InstallmentProofRoute } from "./pages/installment/installment-proof/installment-proof.route";
import { InstallmentPaymentRoute } from "./pages/installment/installment-payment/installment-payment.route";
import { ProductsRoute } from "./pages/products/products.routes";
import { CustomersRoutes } from "./pages/customers-and-supplier/customers/customers.route";
import { SuppliersRoute } from "./pages/customers-and-supplier/suppliers/suppliers.routes";
import { DelegateRoute } from "./pages/customers-and-supplier/thedelegate/thedelegate.route";
import { AccountsParentRoute } from "./pages/accounts-parent/accounts-parent.route";
import { ReceivablesRoute } from "./pages/Receivables/receivables.route";
import { ExpensesRoute } from "./pages/expenses/expenses.route";
import { costCenterAndProjectsRoute } from "./pages/costcenter-and-projects/costcenter-and-projects.route";
import { UsersAndPermissionsRoute } from "./pages/users-and-permissions/users-and-permissions.route";
import { HrRoute } from "./pages/hr/hr.routes";
import { SettingsRoute } from "./pages/settings/settings.routes";
import { ElectronicInvoiceRoute } from "./pages/electronic-invoice/electronic-invoice.routes";
import { BranchesRoutes } from "./pages/customers-and-supplier/branches/branches.routes";



export const dashboardRoute:Routes = [
    {
        path:'',
        loadComponent:()=>import('./dashboard').then(mod=>mod.Dashboard),
        children:[
            {path:'',redirectTo:'/home',pathMatch:'full'},
            {
                path:"home",
                loadComponent:()=>import('./pages/home/home').then(mod=>mod.Home)
            },
           ...purchaseOrderRoute,
           ...autometedPurchaseOrderRoute,
           ...PurchaseInvoiceRoute,
           ...internationalPurchaseInvoiceRoute,
           ...purchaseReturnsRoute,
           ...purchaseReturnsWithoutInvoiceNumberRoute,
           ...MultiplyPurchaseReturnsRoute,
           ...PurchaseInvoiceDraft,
           ...displaySalesPrices,
           ...salesInvoiceRoute,
           ...deliveryGoodsRoute,
           ...disbursingReservationsRoute,
           ...DepitNotificationRoutes,
           ...salesReturnsPageRoutes,
           ...MultiplySalesReturnsRoutes,
           ...draftSalesInvoiceRoute,
           ...paymentVoucherRoute,
           ...damagedDisbursementRequestRoutes,
           ...QuickSalesPointCashiersRoutes,
           ...InventoryAdjustmentRequestRoutes,
           ...InventoryAdjustmentRoutes,
           ...OpeningBalanceRoute,
           ...SupplyOrderRoute,
           ...ConjugationCommandRoute,
           ...ScrapRoutes,
           ...PeriodicInventoryWarehouseRoute,
           ...InventoryTransferOrderRoute,
           ...IncommingTransferRoute,
           ...InventoryTransferReceiveRoute,
           ...internalExchangeRoute,
           ...TransferBetweenRepositryRoute,
           ...OutgoingTranferRoute,
           ...OutgoingTranferApproveRoute,
           ...IncommingCashTransferRoute,
           ...DepreciationRoute,
           ...CashTransferBetweenTwoBranchesRoute,
           ...QrcodePrinterRoute,
           ...InstallmentProofRoute,
           ...ProductsRoute,
           ...CustomersRoutes,
           ...SuppliersRoute,
           ...DelegateRoute,
           ...InstallmentPaymentRoute,
           ...AccountsParentRoute,
           ...ReceivablesRoute,
           ...ExpensesRoute,
           ...costCenterAndProjectsRoute,
           ...UsersAndPermissionsRoute,
           ...HrRoute,
           ...SettingsRoute,
           ...ElectronicInvoiceRoute,
           ...BranchesRoutes
        ]
    }
]
