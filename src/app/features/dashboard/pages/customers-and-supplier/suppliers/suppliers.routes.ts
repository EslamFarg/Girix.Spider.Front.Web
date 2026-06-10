import { Routes } from "@angular/router";

export const SuppliersRoute:Routes=[
    {
        path:'suppliers',
        loadComponent:()=>import('./suppliers').then(m=>m.Suppliers),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-suppliers/explorer-suppliers').then(m=>m.ExplorerSuppliers)
            },
            {
                path:'add',
                loadComponent:()=>import('./add-suppliers/add-suppliers').then(m=>m.AddSuppliers)
            }
        ]
    }
]