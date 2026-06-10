import { Routes } from "@angular/router";

export const MultiplyPurchaseReturnsRoute:Routes = [
    {
        path:'multiply-purchase-returns',
        loadComponent:()=>import('./multiply-purchase-returns').then(mod=>mod.MultiplyPurchaseReturns),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'add',loadComponent:()=>import('./add-multiply-purchase-returns/add-multiply-purchase-returns').then(mod=>mod.AddMultiplyPurchaseReturns)
            },
            {
                path:'explorer',loadComponent:()=>import('./explorer-multiply-purchase-returns/explorer-multiply-purchase-returns').then(mod=>mod.ExplorerMultiplyPurchaseReturns)
            }
        ]
    }
]