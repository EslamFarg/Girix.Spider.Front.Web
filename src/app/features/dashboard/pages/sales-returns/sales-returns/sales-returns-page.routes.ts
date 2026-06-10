import { Routes } from "@angular/router";

export const salesReturnsPageRoutes:Routes= [
   {
    path:'sales-returns',
    loadComponent:()=>import('./sales-returns').then(m=>m.SalesReturns),
    children:[
        {path:'',redirectTo:'explorer',pathMatch:'full'},
        {path:'explorer',loadComponent:()=>import('./explorer-sales-returns/explorer-sales-returns').then(m=>m.ExplorerSalesReturns)},
        {path:'add',loadComponent:()=>import('./add-sales-returns/add-sales-returns').then(m=>m.AddSalesReturns)}
    ]
   }
]