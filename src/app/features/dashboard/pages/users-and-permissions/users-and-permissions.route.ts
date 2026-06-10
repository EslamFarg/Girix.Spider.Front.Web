import { Routes } from "@angular/router";

export const UsersAndPermissionsRoute:Routes=[
    {
        path:'users-and-permissions',
        loadComponent:()=>import('./users-and-permissions').then(m=>m.UsersAndPermissions),
        children:[
            {path:'users',loadComponent:()=>import('./users/users').then(m=>m.Users),
                children:[
                    {path:'',redirectTo:'explorer',pathMatch:'full'},
                    {
                        path:'explorer',loadComponent:()=>import('./users/explorer-users/explorer-users').then(m=>m.ExplorerUsers)
                    },
                    {
                        path:'add',loadComponent:()=>import('./users/add-users/add-users').then(m=>m.AddUsers)
                    }
                ]
            },
            {path:'permissions',loadComponent:()=>import('./permissions/permissions').then(m=>m.Permissions)},
            {path:'users-and-permissions',loadComponent:()=>import('./users-and-permissions/users-and-permissions').then(m=>m.UsersAndPermissions),
                children:[
                    {path:'',redirectTo:'explorer',pathMatch:'full'},
                    {
                        path:'explorer',loadComponent:()=>import('./users-and-permissions/explorer-users-and-permissions/explorer-users-and-permissions').then(m=>m.ExplorerUsersAndPermissions)
                    },
                    {
                        path:'add',loadComponent:()=>import('./users-and-permissions/add-users-and-permissions/add-users-and-permissions').then(m=>m.AddUsersAndPermissions)
                    }
                ]
            }
        ]
    }
]