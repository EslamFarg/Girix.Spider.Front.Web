import { Routes } from "@angular/router";

export const internationalPurchaseInvoiceRoute:Routes = [
    {
        path:'international-purchase-invoice',
        loadComponent: () => import('./international-purchase-invoice').then(m => m.InternationalPurchaseInvoice),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'add',
                loadComponent: () => import('./add-international-purchase-invoice/add-international-purchase-invoice').then(m => m.AddInternationalPurchaseInvoice)
            },
            {
                path:'explorer',
                loadComponent: () => import('./explorer-international-purchase-invoice/explorer-international-purchase-invoice').then(m => m.ExplorerInternationalPurchaseInvoice)
            }
        ]
    }
]