import { Routes } from '@angular/router';

export const InstallmentPaymentRoute:Routes = [
    {
        path: 'installment-payment',
        loadComponent: () =>
            import('./installment-payment').then(
                (m) => m.InstallmentPayment
            ),

            children:[
                {path:'',redirectTo:'explorer',pathMatch:'full'},
                {
                    path:'explorer',
                    loadComponent:()=>import('./explorer-installment-payment/explorer-installment-payment').then(m=>m.ExplorerInstallmentPayment)
                },
                {
                    path:'add',
                    loadComponent:()=>import('./add-installment-payment/add-installment-payment').then(m=>m.AddInstallmentPayment)
                }
            ]
    },
];