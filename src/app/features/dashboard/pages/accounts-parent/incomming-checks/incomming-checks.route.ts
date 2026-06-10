import { Routes } from "@angular/router";

export const IncommingChecksRoute:Routes=[
    {
        path:'incomming-checks',
        loadComponent:()=>import('./incomming-checks').then(m=>m.IncommingChecks),
        children: [
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path: 'add',
                loadComponent: () => import('./add-incomming-checks/add-incomming-checks').then(m => m.AddIncommingChecks)
            },
            {
                path: 'explorer',
                loadComponent: () => import('./explorer-incomming-checks/explorer-incomming-checks').then(m => m.ExplorerIncommingChecks)
            }
        ]
    }
]