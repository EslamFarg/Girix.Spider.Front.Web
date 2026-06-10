import { Routes } from "@angular/router";

export const EmployeesRoutes:Routes=[
    {
        path:'employees',
        loadComponent:()=>import('./employees').then(m=>m.Employees),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {path:'add',loadComponent:()=>import('./add-employees/add-employees').then(m=>m.AddEmployees)},
            {path:'explorer',loadComponent:()=>import('./explorer-employees/explorer-employees').then(m=>m.ExplorerEmployees)}
        ]
    }
]