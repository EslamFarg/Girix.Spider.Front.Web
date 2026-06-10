import { Routes } from '@angular/router';

export const deliveryGoodsRoute:Routes=[
    {
        path:'delivery-goods',
        loadComponent:()=>import('./delivery-goods').then(mod=>mod.DeliveryGoods),
        children:[
            {
                path:'',redirectTo:'explorer',pathMatch:'full'
            },
            {
                path:'add',
                loadComponent:()=>import('./add-delivery-goods/add-delivery-goods').then(mod=>mod.AddDeliveryGoods)
            },
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-delivery-goods/explorer-delivery-goods').then(mod=>mod.ExplorerDeliveryGoods)
            }
        ]
    }
]