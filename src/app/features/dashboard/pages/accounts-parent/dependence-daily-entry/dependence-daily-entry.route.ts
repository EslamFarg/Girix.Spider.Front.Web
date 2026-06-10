import { Routes } from "@angular/router";

export const DependenceDailyEntryRoute:Routes=[
    {
        path:'dependence-daily-entry',
        loadComponent:()=>import('./dependence-daily-entry').then(m=>m.DependenceDailyEntry),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {path:'explorer',loadComponent:()=>import('./explorer-dependence-daily-entry/explorer-dependence-daily-entry').then(m=>m.ExplorerDependenceDailyEntry)},
            {path:'add',loadComponent:()=>import('./add-dependence-daily-entry/add-dependence-daily-entry').then(m=>m.AddDependenceDailyEntry)}
        ]
    }
]