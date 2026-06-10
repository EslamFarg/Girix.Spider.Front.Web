import { Routes } from "@angular/router";

export const IncommingCashTransferRoute:Routes=[
    {
        path:'incomming-cash-transfer',
        loadComponent:()=>import('./incomming-cash-transfer').then(m=>m.IncommingCashTransfer),
        children:[
            {
                path:'',redirectTo:'explorer',pathMatch:'full'
            },
            {
                path:'explorer',loadComponent:()=>import('./explorer-incomming-cash-transfer/explorer-incomming-cash-transfer').then(m=>m.ExplorerIncommingCashTransfer),
            },
            {
                path:'add',loadComponent:()=>import('./add-incomming-cash-transfer/add-incomming-cash-transfer').then(m=>m.AddIncommingCashTransfer)
            }
        ]
    }
]