import { Routes } from "@angular/router";

export const QuickSalesPointCashiersRoutes:Routes = [
    {
        path:'quick-sales-point-cashiers',
        loadComponent:()=>import('./quick-sales-point-cashiers').then(mod=>mod.QuickSalesPointCashiers),
        children:[
            {
                path:'',redirectTo:'add',pathMatch:'full'
            },
            {
                path:'add',
                loadComponent:()=>import('./add-quick-sales-point-cashiers/add-quick-sales-point-cashiers').then(mod=>mod.AddQuickSalesPointCashiers)
            },
            {
                path:'query',
                loadComponent:()=>import('./query-quick-sales-point-cashiers/query-quick-sales-point-cashiers').then(mod=>mod.QueryQuickSalesPointCashiers)
            },
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-quick-sales-point-cashiers/explorer-quick-sales-point-cashiers').then(mod=>mod.ExplorerQuickSalesPointCashiers)
            }
        ]
    }
]