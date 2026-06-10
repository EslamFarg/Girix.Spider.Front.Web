import { Routes } from "@angular/router";

export const SupplyOrderRoute:Routes=[
    {
        path:'supply-order',
        loadComponent:()=>import('./supply-order').then(mod=>mod.SupplyOrder),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'add',
                loadComponent:()=>import('./add-supply-order/add-supply-order').then(mod=>mod.AddSupplyOrder)
            },
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-supply-order/explorer-supply-order').then(mod=>mod.ExplorerSupplyOrder)
            },
        ]
    }
]