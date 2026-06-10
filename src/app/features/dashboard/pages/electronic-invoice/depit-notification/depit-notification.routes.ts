import { Routes } from '@angular/router';

export const DepitNotificationRoutes:Routes=[
    {
        path:'depit-notification',
        loadComponent:()=>import('./depit-notification').then(m=>m.DepitNotification),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-depit-notification/explorer-depit-notification').then(m=>m.ExplorerDepitNotification)
            },
            {
                path:'add',
                loadComponent:()=>import('./add-depit-notification/add-depit-notification').then(mod=>mod.AddDepitNotification)
            }
        ]
    },
   
]