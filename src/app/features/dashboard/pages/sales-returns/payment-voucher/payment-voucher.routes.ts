import { Routes } from "@angular/router";

export const paymentVoucherRoute:Routes=[
    {
        path:'payment-voucher',
        loadComponent:()=>import('./payment-voucher').then(m=>m.PaymentVoucher),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {path:'explorer',loadComponent:()=>import('./explorer-payment-voucher/explorer-payment-voucher').then(m=>m.ExplorerPaymentVoucher)},
            {
                path:'add',
                loadComponent:()=>import('./add-payment-voucher/add-payment-voucher').then(m=>m.AddPaymentVoucher)
            }
        ]
    }
]