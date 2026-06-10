import { Routes } from "@angular/router";

export const internalExchangeRoute:Routes=[
    {
        path:'internal-exchange-permit',
        loadComponent:()=>import('./internal-exchange-permit').then(m=>m.InternalExchangePermit),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {path:'explorer', loadComponent:()=>import('./explorer-internal-exchange-permit/explorer-internal-exchange-permit').then(m=>m.ExplorerInternalExchangePermit)},
            {path:'add',loadComponent:()=>import('./add-internal-exchange-permit/add-internal-exchange-permit').then(m=>m.AddInternalExchangePermit)}
        ]
    }
    
]   