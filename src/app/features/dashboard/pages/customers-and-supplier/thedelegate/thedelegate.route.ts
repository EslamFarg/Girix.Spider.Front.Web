import { Routes } from "@angular/router";

export const DelegateRoute:Routes=[
    {
        path:'the-delegate',loadComponent:()=>import('./thedelegate').then(m=>m.Thedelegate),
        children:[
            {
                path:'',redirectTo:'explorer',pathMatch:'full'
            },
            {
                path:'explorer',loadComponent:()=>import('./explorer-the-delegate/explorer-the-delegate').then(m=>m.ExplorerTheDelegate)
            },
            {
                path:'add',loadComponent:()=>import('./add-the-delegate/add-the-delegate').then(m=>m.AddTheDelegate)
            }
        ]
    }
]