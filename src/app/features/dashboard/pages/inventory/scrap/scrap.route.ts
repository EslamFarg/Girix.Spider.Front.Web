import { Routes } from "@angular/router";

export const ScrapRoutes:Routes=[
    {
        path:'scrap',
        loadComponent:()=>import('./scrap').then(mod=>mod.Scrap),
        children:[
            {
                path:'',redirectTo:'explorer',pathMatch:'full'
            },
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-scrap/explorer-scrap').then(mod=>mod.ExplorerScrap)
            },
            {
                path:'add',loadComponent:()=>import('./add-scrap/add-scrap').then(mod=>mod.AddScrap)
            }
        ]
    }
]