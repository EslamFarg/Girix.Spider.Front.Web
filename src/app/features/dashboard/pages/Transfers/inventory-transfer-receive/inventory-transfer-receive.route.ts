import { Route, Routes } from "@angular/router";

export const InventoryTransferReceiveRoute:Routes =[
    {
        path:'inventory-transfer-receive',
        loadComponent:()=>import('./inventory-transfer-receive').then(m=>m.InventoryTransferReceive),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-inventory-transfer-receive/explorer-inventory-transfer-receive').then(m=>m.ExplorerInventoryTransferReceive)
            },
            {
                path:'add',
                loadComponent:()=>import('./add-inventory-transfer-receive/add-inventory-transfer-receive').then(m=>m.AddInventoryTransferReceive)
            }
        ]
    }
]