import { Routes } from "@angular/router";

export const ReceiptVoucherRoute:Routes=[
   {
            path:'receipt-voucher',
            loadComponent:()=>import('./receipt-voucher').then(m=>m.ReceiptVoucher),
            children:[
                { path:'',redirectTo:'explorer',pathMatch:'full'},
                { path:'add',loadComponent:()=>import('./add-receipt-voucher/add-receipt-voucher').then(m=>m.AddReceiptVoucher)},
                { path:'explorer',loadComponent:()=>import('./explorer-receipt-voucher/explorer-receipt-voucher').then(m=>m.ExplorerReceiptVoucher)}
            ]
          }
]