import { Routes } from "@angular/router";

export const InventoryAdjustmentRoutes:Routes = [
    {
        path:'inventory-adjustment',
        loadComponent:()=>import('./inventory-adjustment').then(mod=>mod.InventoryAdjustment),
        children:[
            {
                path:'', redirectTo: 'explorer', pathMatch: 'full'
            },  
            {
                path:'add',
                loadComponent:()=>import('./add-inventory-adjustment/add-inventory-adjustment').then(mod=>mod.AddInventoryAdjustment)
            },
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-inventory-adjustment/explorer-inventory-adjustment').then(mod=>mod.ExplorerInventoryAdjustment)
            }
        ]
    }
]