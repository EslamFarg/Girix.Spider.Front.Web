import { Routes } from "@angular/router";

export const OutgoingTranferApproveRoute:Routes=[
    {
        path:'outgoing-transfer-approve',
        loadComponent:()=>import('./outgoing-transfer-approve').then(m=>m.OutgoingTransferApprove),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-outgoing-transfer-approve/explorer-outgoing-transfer-approve').then(m=>m.ExplorerOutgoingTransferApprove)
            },
            {
                path:'add',
                loadComponent:()=>import('./add-outgoing-transfer-approve/add-outgoing-transfer-approve').then(m=>m.AddOutgoingTransferApprove)
            }
        ]
    }
]