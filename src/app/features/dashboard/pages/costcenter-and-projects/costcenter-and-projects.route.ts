import { Routes } from "@angular/router";
import { ProjectsRoute } from "./projects/projects.route";

export const costCenterAndProjectsRoute:Routes=[
    {
        path:'costcenter-and-projects',
        loadComponent:()=>import('./costcenter-and-projects').then(m=>m.CostcenterAndProjects),
        children:[
            {path:'cost-center',loadComponent:()=>import('./cost-center/cost-center').then(m=>m.CostCenter)},
            ...ProjectsRoute
        ]
    }
]