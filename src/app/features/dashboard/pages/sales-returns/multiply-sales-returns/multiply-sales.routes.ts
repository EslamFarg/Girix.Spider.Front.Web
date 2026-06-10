import { Routes } from "@angular/router";

export const MultiplySalesReturnsRoutes:Routes=[
    {
        path:'multiply-sales-returns',loadComponent:()=>import('./multiply-sales-returns').then(mod=>mod.MultiplySalesReturns),
        children:[
            {
                path:'',redirectTo:'explorer',pathMatch:'full'
            },
            {
                path:'explorer',loadComponent:()=>import('./explorer-multiply-sales-returns/explorer-multiply-sales-returns').then(mod=>mod.ExplorerMultiplySalesReturns)
            },
            {
                path:'add',loadComponent:()=>import('./add-multiply-sales-returns/add-multiply-sales-returns').then(mod=>mod.AddMultiplySalesReturns)
            }
        ]
    }
]