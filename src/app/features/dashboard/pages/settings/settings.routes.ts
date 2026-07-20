import { Routes } from "@angular/router";

export const SettingsRoute:Routes=[
    {
        path:'settings',
        loadComponent:()=>import('./settings').then(m=>m.Settings),
        children:[
      /*       {
                path:'company-settings',
                loadComponent:()=>import('./company-settings/company-settings').then(m=>m.CompanySettings)
            }, */
            {
                path:'branch-settings',
                loadComponent:()=>import('./branch-settings/branch-settings').then(m=>m.BranchSettings)
            },
            {
                path:'virtual-accounts',
                loadComponent:()=>import('./virtual-accounts/virtual-accounts').then(m=>m.VirtualAccounts)
            }
        ]
    }
]