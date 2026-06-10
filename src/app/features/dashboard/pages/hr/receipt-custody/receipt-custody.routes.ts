import { Routes } from "@angular/router";

export const ReceiptCustodyRoute:Routes=[
    {
        path:'receipt-custody',
        loadComponent:()=>import('./receipt-custody').then(m=>m.ReceiptCustody),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-receipt-custody/explorer-receipt-custody').then(m=>m.ExplorerReceiptCustody)
            },
            {
                path:'add',
                loadComponent:()=>import('./add-receipt-custody/add-receipt-custody').then(m=>m.AddReceiptCustody)
            }
        ]
    }
]