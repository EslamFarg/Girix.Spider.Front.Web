import { Routes } from '@angular/router';

export const BranchesRoutes:Routes=[
    {
        path:'branches',
        loadComponent:()=>import('./branches').then(m=>m.Branches),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-branches/explorer-branches').then(m=>m.ExplorerBranches)
            },
            {
                path:'add',
                loadComponent:()=>import('./add-branch/add-branch').then(m=>m.AddBranch)
            }
        ]
    }
]