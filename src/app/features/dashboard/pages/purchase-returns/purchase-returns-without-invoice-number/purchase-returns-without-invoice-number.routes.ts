import { Routes } from '@angular/router';

export const purchaseReturnsWithoutInvoiceNumberRoute:Routes = [
    {
        path:'purchase-returns-without-invoice-number',
        loadComponent:()=>import('./purchase-returns-without-invoice-number').then(mod=>mod.PurchaseReturnsWithoutInvoiceNumber),
        children:[
            {
                path:'',redirectTo:'explorer',pathMatch:'full',

            },
            {path:'explorer',loadComponent:()=>import('./explorer-purchase-returns-without-invoice-number/explorer-purchase-returns-without-invoice-number').then(mod=>mod.ExplorerPurchaseReturnsWithoutInvoiceNumber)},
            {path:'add',loadComponent:()=>import('./add-purchase-returns-without-invoice-number/add-purchase-returns-without-invoice-number').then(mod=>mod.AddPurchaseReturnsWithoutInvoiceNumber)}
        ]
    }
]