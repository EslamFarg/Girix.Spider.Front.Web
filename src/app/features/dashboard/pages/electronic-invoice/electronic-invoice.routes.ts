import { Routes } from '@angular/router';
import { SalesInvoiceRoute } from './sales-invoice/sales-invoice.routes';
import { CreditNotificationRoute } from './credit-notification/credit-notification.routes';
import { DepitNotificationRoutes } from './depit-notification/depit-notification.routes';

export const ElectronicInvoiceRoute:Routes=[
    {
        path:'electronic-invoice',
        loadComponent:()=>import('./electronic-invoice').then(m=>m.ElectronicInvoice),
        children:[
        ...SalesInvoiceRoute,
        {path:'invoice-ecommerce',loadComponent:()=>import('./invoice-ecommerce/invoice-ecommerce').then(m=>m.InvoiceEcommerce)},
        ...CreditNotificationRoute,
        ...DepitNotificationRoutes
        ]
    }
]