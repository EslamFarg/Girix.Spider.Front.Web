import { Routes } from "@angular/router";

export const OutgoingTranferRoute:Routes=[
    {
        path:'outgoing-transfer',
        loadComponent:()=>import('./outgoing-transfer').then(m=>m.OutgoingTransfer),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {path:'explorer',loadComponent:()=>import('./explorer-outgoing-transfer/explorer-outgoing-transfer').then(m=>m.ExplorerOutgoingTransfer)},
            {path:'add',loadComponent:()=>import('./add-outgoing-transfer/add-outgoing-transfer').then(m=>m.AddOutgoingTransfer)}
        ]
    }
]