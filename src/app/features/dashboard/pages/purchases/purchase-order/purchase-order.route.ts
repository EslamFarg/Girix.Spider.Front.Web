import { Routes } from "@angular/router";


export const purchaseOrderRoute:Routes = [
    {
        path:'purchase-order',
        loadComponent:()=>import('./purchase-order').then(mod=>mod.PurchaseOrder),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:"add",
                loadComponent:()=>import('./add-purchase-order/add-purchase-order').then(mod=>mod.AddPurchaseOrder)
            },
            {
                path:"explorer",
                loadComponent:()=>import('./explorer-purchase-order/explorer-purchase-order').then(mod=>mod.ExplorerPurchaseOrder)
            }
        ]
    }
];