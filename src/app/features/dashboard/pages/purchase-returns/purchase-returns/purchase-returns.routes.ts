import { Routes } from "@angular/router";

export const purchaseReturnsRoute:Routes = [
    {
        path:'purchase-returns',
        loadComponent:()=>import('./purchase-returns').then(mod=>mod.PurchaseReturns),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
            
                path:'add',
                loadComponent:()=>import('./add-purchase-returns/add-purchase-returns').then(mod=>mod.AddPurchaseReturns)
            },
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-purchase-returns/explorer-purchase-returns').then(mod=>mod.ExplorerPurchaseReturns)
            }
        ]
    }
]