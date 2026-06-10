import { Routes } from "@angular/router";

export const CashTransferBetweenTwoBranchesRoute:Routes=[
    {
        path:'cash-transfer-between-two-branches',
       loadComponent:()=>import('./cash-transfer-between-two-branches').then(m=>m.CashTransferBetweenTwoBranches),
       children:[
        {path:'',redirectTo:'explorer',pathMatch:'full'},
        {
            path:'explorer',
            loadComponent:()=>import('./explorer-cash-transfer-between-two-branches/explorer-cash-transfer-between-two-branches').then(m=>m.ExplorerCashTransferBetweenTwoBranches)
        },
        {
            path:'add',
            loadComponent:()=>import('./add-cash-transfer-between-two-branches/add-cash-transfer-between-two-branches').then(m=>m.AddCashTransferBetweenTwoBranches)
        }
       ]
    }
]