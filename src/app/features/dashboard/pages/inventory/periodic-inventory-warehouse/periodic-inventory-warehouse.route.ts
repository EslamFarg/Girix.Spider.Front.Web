import { Routes } from "@angular/router";

export const PeriodicInventoryWarehouseRoute:Routes=[
    {
        path:'periodic-inventory-warehouse',
        loadComponent:()=>import('./periodic-inventory-warehouse').then(m=>m.PeriodicInventoryWarehouse),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-periodic-inventory-warehouse/explorer-periodic-inventory-warehouse').then(m=>m.ExplorerPeriodicInventoryWarehouse)
            },
            {
                path:'add',
                loadComponent:()=>import('./add-periodic-inventory-warehouse/add-periodic-inventory-warehouse').then(m=>m.AddPeriodicInventoryWarehouse)
            }
        ]
    }
]