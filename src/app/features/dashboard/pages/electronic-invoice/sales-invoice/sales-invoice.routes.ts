import { Routes } from '@angular/router';

export const SalesInvoiceRoute:Routes=[
    {
        path:'electronic-sales-invoice',loadComponent:()=>import('./sales-invoice').then(m=>m.SalesInvoice),
          children:[
                    {path:'',redirectTo:'explorer',pathMatch:'full'},
                    {
                        path:'add',
                        loadComponent:()=>import('./add-sales-invoice/add-sales-invoice').then(m=>m.AddSalesInvoice)
                    },
                    {
                        path:'explorer',
                        loadComponent:()=>import('./explorer-sales-invoice/explorer-sales-invoice').then(m=>m.ExplorerSalesInvoice)
                    }

                ]
    }
]