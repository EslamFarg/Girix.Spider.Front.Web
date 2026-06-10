import { Routes } from "@angular/router";

export const autometedPurchaseOrderRoute:Routes = [
    {
        path:'autometed-purchase-order',
        loadComponent:()=>import('./autometed-purchase-order').then(mod=>mod.AutometedPurchaseOrder),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:"add",
                loadComponent:()=>import('./add-autometed-purchase-order/add-autometed-purchase-order').then(mod=>mod.AddAutometedPurchaseOrder)
            },
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-autometed-purchase-order/explorer-autometed-purchase-order').then(mod=>mod.ExplorerAutometedPurchaseOrder)
            }
        ]
    }
]