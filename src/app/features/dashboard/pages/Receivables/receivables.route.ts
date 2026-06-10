import { Routes } from "@angular/router";
import { ReceiptVoucherRoute } from "./receipt-voucher/receipt-voucher.route";
import { MultiplyReceiptVoucher } from "./multiply-receipt-voucher/multiply-receipt-voucher";
import { MultiplyReceiptVoucherRoute } from "./multiply-receipt-voucher/multiply-receipt-voucher.route";

export const ReceivablesRoute:Routes=[
    {
        path:'receivables',
        loadComponent:()=>import('./receivables').then(m=>m.Receivables),
        children:[
            ...ReceiptVoucherRoute,
            ...MultiplyReceiptVoucherRoute
        ]
    }
]