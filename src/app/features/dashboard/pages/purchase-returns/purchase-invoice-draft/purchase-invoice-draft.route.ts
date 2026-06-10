import { Routes } from "@angular/router";

export const PurchaseInvoiceDraft:Routes=[
    {
        path:'purchase-invoice-draft',
        loadComponent:()=>import('./purchase-invoice-draft').then(mod=>mod.PurchaseInvoiceDraft),
    }
]