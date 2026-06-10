import { Routes } from "@angular/router";

export const IncommingTransferRoute:Routes=[
    {
        path:'incomming-transfer',
        loadComponent:()=>import('./incomming-transfer').then(m=>m.IncommingTransfer),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-incomming-transfer/explorer-incomming-transfer').then(m=>m.ExplorerIncommingTransfer)
            },
            {
                path:'add',
                loadComponent:()=>import('./add-incomming-transfer/add-incomming-transfer').then(m=>m.AddIncommingTransfer)
            }
        ]
    }
]