import { Routes } from '@angular/router';

export const PurchaseInvoiceRoute:Routes = [
    {
        path:'purchase-invoice',
        loadComponent:()=>import('./purchase-invoice').then(mod=>mod.PurchaseInvoice),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'add',
                loadComponent:()=>import('./add-purchase-invoice/add-purchase-invoice').then(mod=>mod.AddPurchaseInvoice)
            },
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-purchase-invoice/explorer-purchase-invoice').then(mod=>mod.ExplorerPurchaseInvoice)
            },
        ]
    }
]