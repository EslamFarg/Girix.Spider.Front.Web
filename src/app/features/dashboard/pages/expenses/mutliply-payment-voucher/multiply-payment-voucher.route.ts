import { Routes } from "@angular/router";

export const MultiplyPaymentVoucherRoute:Routes=[
    {
        path:'multiply-payment-voucher',
        loadComponent:()=>import('./mutliply-payment-voucher').then(m=>m.MutliplyPaymentVoucher),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'add',
                loadComponent:()=>import('./add-multiply-payment-voucher/add-multiply-payment-voucher').then(m=>m.AddMultiplyPaymentVoucher)
            },
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-multiply-payment-voucher/explorer-multiply-payment-voucher').then(m=>m.ExplorerMultiplyPaymentVoucher)
            }
        ]
    }
]