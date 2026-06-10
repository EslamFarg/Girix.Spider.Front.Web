import { Routes } from "@angular/router";

export const OpeningBalanceRoute:Routes=[
    {
        path:'opening-balance',
        loadComponent:()=>import('./opening-balance').then(m=>m.OpeningBalance),
        children:[
            {
                path:'',redirectTo:'explorer',pathMatch:'full'
            },
            {
                path:'explorer',loadComponent:()=>import('./explorer-opening-balance/explorer-opening-balance').then(m=>m.ExplorerOpeningBalance)
            },
            {
                path:'add',loadComponent:()=>import('./add-opening-balance/add-opening-balance').then(m=>m.AddOpeningBalance)
            }
        ]
    },
]