import { Routes } from "@angular/router";

export const ProductsRoute:Routes=[
    {
        path:'products',
        loadComponent:()=>import('./products').then(m=>m.Products),
        children:[
           {path:'units-of-measurement',
            loadComponent:()=>import('./units-of-measurement/units-of-measurement').then(m=>m.UnitsOfMeasurement)
           },
           {
            path:'categories',
            loadComponent:()=>import('./categories/categories').then(m=>m.Categories)
           },
           {
            path:'groups',
            loadComponent:()=>import('./groups/groups').then(m=>m.Groups)
           },
           {
            path:'product-card',
            loadComponent:()=>import('./product-card/product-card').then(m=>m.ProductCard)
           },
           {
            path:'inventories',
            loadComponent:()=>import('./inventories/inventories').then(m=>m.Inventories)
           },
      
        ]
    }
]