import { Routes } from "@angular/router";

export const salesInvoiceRoute:Routes=[
    {
        path:'sales-invoice',
        loadComponent:()=>import('./sales-invoice').then(mod=>mod.SalesInvoice),
        children:[
            {
                path:'',redirectTo:'explorer',pathMatch:'full'
            },
            {
                path:'add',loadComponent:()=>import('./add-sales-invoice/add-sales-invoice').then(mod=>mod.AddSalesInvoice)
            },
            {
                path:'explorer',loadComponent:()=>import('./explorer-sales-invoice/explorer-sales-invoice').then(mod=>mod.ExplorerSalesInvoice)
            }
        ]
    }
]