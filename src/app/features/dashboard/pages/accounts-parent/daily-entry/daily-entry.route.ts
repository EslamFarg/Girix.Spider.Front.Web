import { Routes } from "@angular/router";

export const DailyEntryRoute:Routes=[
    {
        path:'daily-entry',
        loadComponent:()=>import('./daily-entry').then(m=>m.DailyEntry),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {path:'explorer',loadComponent:()=>import('./explorer-daily-entry/explorer-daily-entry').then(m=>m.ExplorerDailyEntry)},
            {path:'add',loadComponent:()=>import('./add-daily-entry/add-daily-entry').then(m=>m.AddDailyEntry)}
        ]
    }
]