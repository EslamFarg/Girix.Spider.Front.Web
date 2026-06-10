import { Routes } from "@angular/router";

export const ProjectsRoute:Routes=[
    {
        path:'projects',
        loadComponent:()=>import('./projects').then(m=>m.Projects),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-projects/explorer-projects').then(m=>m.ExplorerProjects)
            },
            {
                path:'add',
                loadComponent:()=>import('./add-projects/add-projects').then(m=>m.AddProjects)
            }
        ]
    }
]