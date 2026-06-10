import { Routes } from "@angular/router";

export const TransferBetweenRepositryRoute:Routes=[
    {
        path:'transfer-between-repositry',
       loadComponent:()=>import('./transfer-between-repositry').then(m=>m.TransferBetweenRepositry),
       children:[
        {path:'',redirectTo:'explorer',pathMatch:'full'},

        {
            path:'explorer',
            loadComponent:()=>import('./explorer-transfer-between-repositry/explorer-transfer-between-repositry').then(m=>m.ExplorerTransferBetweenRepositry)
        },
        {
            path:'add',
            loadComponent:()=>import('./add-transfer-between-repositry/add-transfer-between-repositry').then(m=>m.AddTransferBetweenRepositry)
        }
       ]
    }
]