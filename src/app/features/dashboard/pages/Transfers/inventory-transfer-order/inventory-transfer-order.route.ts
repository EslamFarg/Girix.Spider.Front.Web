import { Routes } from "@angular/router";

export const InventoryTransferOrderRoute:Routes=[
    {
        path:'inventory-transfer-order',
        loadComponent:()=>import('./inventory-transfer-order').then(m=>m.InventoryTransferOrder),
        children:[
            {
                path:'',redirectTo:'explorer',pathMatch:'full'
            },
            {
                path:'explorer',loadComponent:()=>import('./explorer-inventory-transfer-order/explorer-inventory-transfer-order').then(m=>m.ExplorerInventoryTransferOrder)
            },
            {
                path:'add',loadComponent:()=>import('./add-inventory-transfer-order/add-inventory-transfer-order').then(m=>m.AddInventoryTransferOrder)
            }
        ]
    }
]