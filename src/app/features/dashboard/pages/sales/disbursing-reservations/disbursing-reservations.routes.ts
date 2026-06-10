import { Routes } from "@angular/router";

export const disbursingReservationsRoute:Routes=[
    {
        path:'disbursing-reservations',
        loadComponent:()=>import('./disbursing-reservations').then(mod=>mod.DisbursingReservations)
    }
]