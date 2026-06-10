import { Routes } from "@angular/router";

export const DepreciationRoute:Routes=[
    {
        path:'depreciations',
        loadComponent:()=>import('./depreciations').then(m=>m.Depreciations),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'add',
                loadComponent:()=>import('./add-depreciations/add-depreciations').then(m=>m.AddDepreciations)
            },
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-depreciations/explorer-depreciations').then(m=>m.ExplorerDepreciations)
            }
        ]
    }
]