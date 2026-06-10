import { Routes } from "@angular/router";

export const MultiplyReceiptVoucherRoute:Routes=[
    {
        path:'multiply-receipt-voucher',
        loadComponent:()=>import('./multiply-receipt-voucher').then(m=>m.MultiplyReceiptVoucher),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'add',
                loadComponent:()=>import('./add-multiply-receipt-voucher/add-multiply-receipt-voucher').then(m=>m.AddMultiplyReceiptVoucher)
            },
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-multiply-receipt-voucher/explorer-multiply-receipt-voucher').then(m=>m.ExplorerMultiplyReceiptVoucher)
            }
        ]
    }
]