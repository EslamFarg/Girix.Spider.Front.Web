import { Routes } from "@angular/router";
import { EmployeesRoutes } from "./employees/employees.routes";
import { AddAddition } from "./addition/add-addition/add-addition";
import { AdditionRoute } from "./addition/addition.route";
import { ReceiptCustodyRoute } from "./receipt-custody/receipt-custody.routes";
import { ProofOfSalaryRoute } from "./proof-of-salary/proof-of-salary.routes";

export const HrRoute:Routes=[
    {
        path:'hr',
        loadComponent:()=>import('./hr').then(m=>m.Hr),
        children:[
            {
                path:'sections',
                loadComponent:()=>import('./sections/sections').then(m=>m.Sections)
            },
            ...EmployeesRoutes,
            ...ProofOfSalaryRoute,
            {
                path:'exchange-of-salaries',
                loadComponent:()=>import('./exchange-of-salaries/exchange-of-salaries').then(m=>m.ExchangeOfSalaries)
            },
           ...AdditionRoute,
          ...ReceiptCustodyRoute,
          {
            path:'custody',
            loadComponent:()=>import('./custody/custody').then(m=>m.Custody)
          },
          {
            path:'allowances',
            loadComponent:()=>import('./allowances/allowances').then(m=>m.Allowances)
          }
        ]
    }
]