import { Routes } from "@angular/router";

export const simplePaymentVoucherRoute:Routes=[
    {
        path:'simple-payment-voucher',
        loadComponent:()=>import('./simple-payment-voucher').then(m=>m.SimplePaymentVoucher),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'add',
                loadComponent:()=>import('./add-simple-payment-voucher/add-simple-payment-voucher').then(m=>m.AddSimplePaymentVoucher)
            },
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-simple-payment-voucher/explorer-simple-payment-voucher').then(m=>m.ExplorerSimplePaymentVoucher)
            }
        ]
    }
]