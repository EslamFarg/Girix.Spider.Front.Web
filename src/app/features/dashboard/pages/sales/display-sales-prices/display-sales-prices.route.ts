import { Routes } from "@angular/router";

export const displaySalesPrices:Routes=[
    {
        path:'display-sales-prices',
        loadComponent:()=>import('./display-sales-prices').then(mod=>mod.DisplaySalesPrices),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},

            {
                path:'explorer',
                loadComponent:()=>import('./explorer-display-sales-prices/explorer-display-sales-prices').then(mod=>mod.ExplorerDisplaySalesPrices)
            },
            {
                path:'add',
                loadComponent:()=>import('./add-display-sales-prices/add-display-sales-prices').then(mod=>mod.AddDisplaySalesPrices)
            }
        ]
    }
]