import { Routes } from "@angular/router";

export const damagedDisbursementRequestRoutes:Routes = [
{
    path:'damaged-disbursement-request',
    loadComponent:()=>import('./damaged-disbursement-request').then(m=>m.DamagedDisbursementRequest),
    children:[
        {path:'',redirectTo:'explorer',pathMatch:'full'},
        {
            path:'explorer',loadComponent:()=>import('./explorer-damaged-disbursement-request/explorer-damaged-disbursement-request').then(m=>m.ExplorerDamagedDisbursementRequest)
        },
        {
            path:'add',loadComponent:()=>import('./add-damaged-disbursement-request/add-damaged-disbursement-request').then(m=>m.AddDamagedDisbursementRequest)
        }
    ]
}
]