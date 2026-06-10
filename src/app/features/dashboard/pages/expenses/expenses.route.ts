import { Routes } from "@angular/router";
import { paymentVoucherRoute } from "../sales-returns/payment-voucher/payment-voucher.routes";
import { simplePaymentVoucherRoute } from "./simple-payment-voucher/simple-payment-voucher.route";
import { MultiplyPaymentVoucherRoute } from "./mutliply-payment-voucher/multiply-payment-voucher.route";

export const ExpensesRoute:Routes=[
    {
        path:'expenses',
        loadComponent:()=>import('./expenses').then(m=>m.Expenses),
        children:[
            ...simplePaymentVoucherRoute,
            ...MultiplyPaymentVoucherRoute
        ]
    }
]