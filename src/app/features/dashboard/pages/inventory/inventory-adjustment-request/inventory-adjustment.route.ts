import { Routes } from "@angular/router";

export const InventoryAdjustmentRequestRoutes: Routes = [
    {
        path: 'inventory-adjustment-request',
        loadComponent: () => import('./inventory-adjustment-request').then(mod => mod.InventoryAdjustmentRequest),
        children: [
            {
                path:'', redirectTo: 'explorer', pathMatch: 'full'
            },
            {
                path:'add',
                loadComponent:()=>import('./add-inventory-adjustment-request/add-inventory-adjustment-request').then(mod=>mod.AddInventoryAdjustmentRequest)
            },
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-inventory-adjustment-request/explorer-inventory-adjustment-request').then(mod=>mod.ExplorerInventoryAdjustmentRequest)
            }
        ]
    }
]