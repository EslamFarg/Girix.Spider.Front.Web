import { Routes } from '@angular/router';

export const InstallmentProofRoute:Routes = [
    {
        path:'installment-proof',
        loadComponent:()=>import('./installment-proof').then(m=>m.InstallmentProof),
        children:[
            {path:'',redirectTo:'explorer',pathMatch:'full'},
            {
                path:'add',
                loadComponent:()=>import('./add-installment-proof/add-installment-proof').then(m=>m.AddInstallmentProof)
            },
            {
                path:'explorer',
                loadComponent:()=>import('./explorer-installment-proof/explorer-installment-proof').then(m=>m.ExplorerInstallmentProof)
            }
        ]
    }
]