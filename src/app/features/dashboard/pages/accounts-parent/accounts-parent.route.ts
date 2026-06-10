import { Routes } from "@angular/router";
import { DailyEntryRoute } from "./daily-entry/daily-entry.route";
import { DependenceDailyEntryRoute } from "./dependence-daily-entry/dependence-daily-entry.route";
import { IncommingChecksRoute } from "./incomming-checks/incomming-checks.route";

export const AccountsParentRoute:Routes=[
    {
        path:'accounts-parent',
        loadComponent:()=>import('./accounts-parent').then(m=>m.AccountsParent),
        children:[
            {path:'accounts',loadComponent:()=>import('./accounts/accounts').then(m=>m.Accounts)},
            ...DailyEntryRoute,
            ...DependenceDailyEntryRoute,
            ...IncommingChecksRoute,
            {path:'finance-year',loadComponent:()=>import('./finance-year/finance-year').then(m=>m.FinanceYear)},
        ]
    }
]