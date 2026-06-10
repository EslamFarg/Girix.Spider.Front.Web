import { Routes } from "@angular/router";

export const CreditNotificationRoute:Routes=[
    {
        path:'credit-notification',
        loadComponent:()=>import('./credit-notification').then(m=>m.CreditNotification),
        children:[
            {
                path:'',redirectTo:'explorer',pathMatch:'full'},
            
            {
                path:'add',
                loadComponent:()=>import('./add-credit-notification/add-credit-notification').then(m=>m.AddCreditNotification)
            },
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-credit-notification/explorer-credit-notification').then(m=>m.ExplorerCreditNotification)
            }
        ]
    }
]