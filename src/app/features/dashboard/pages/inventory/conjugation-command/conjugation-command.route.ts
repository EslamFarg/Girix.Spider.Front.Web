import { Routes } from "@angular/router";

export const ConjugationCommandRoute:Routes=[
    {
        path:'conjugation-command',
        loadComponent:()=>import('./conjugation-command').then(mod=>mod.ConjugationCommand),
       children:[
           {path:'',redirectTo:'explorer',pathMatch:'full'},
        {
            path:'explorer',
            loadComponent:()=>import('./exlorer-conjugation-command/exlorer-conjugation-command').then(mod=>mod.ExlorerConjugationCommand)
        },
        {
            path:'add',
            loadComponent:()=>import('./add-conjugation-command/add-conjugation-command').then(mod=>mod.AddConjugationCommand)
        }
       ]
    }
]