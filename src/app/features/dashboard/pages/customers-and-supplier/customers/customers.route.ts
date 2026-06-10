import { Routes } from "@angular/router";

export const CustomersRoutes:Routes=[
    {
        path:'customers',
        loadComponent:()=>import('./customers').then(m=>m.Customers),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-customers/explorer-customers').then(m=>m.ExplorerCustomers)
            },
            {
                path:'add',
                loadComponent:()=>import('./add-customers/add-customers').then(m=>m.AddCustomers)
            }
        ]
    }
]