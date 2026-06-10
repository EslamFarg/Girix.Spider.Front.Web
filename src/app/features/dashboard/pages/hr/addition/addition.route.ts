import { Routes } from "@angular/router";

export const AdditionRoute:Routes=[
    {
        path:'addition',
        loadComponent:()=>import('./addition').then(m=>m.Addition),
        children:[
            {path:'',redirectTo:'add',pathMatch:'full'},
            {
                path:'add',
                loadComponent:()=>import('./add-addition/add-addition').then(m=>m.AddAddition)
            },
              {
                path:'explorer',
                loadComponent:()=>import('./explorer-addition/explorer-addition').then(m=>m.ExplorerAddition)
            }
        ]
    }
]