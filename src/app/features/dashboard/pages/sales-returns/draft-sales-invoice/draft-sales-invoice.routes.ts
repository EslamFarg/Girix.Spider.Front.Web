import { Routes } from '@angular/router';

export const draftSalesInvoiceRoute:Routes=[
    {
        path:'draft-sales-invoice',
        loadComponent:()=>import('./draft-sales-invoice').then(mod=>mod.DraftSalesInvoice),
    }
]