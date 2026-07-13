import { Routes } from '@angular/router';

export const ProofOfSalaryRoute: Routes = [
  {
    path: 'proof-of-salaries',
    loadComponent: () => import('./proof-of-salary').then((m) => m.ProofOfSalary),
    children: [
      { path: '', redirectTo: 'explorer', pathMatch: 'full' },
      {
        path: 'explorer',
        loadComponent: () =>
          import('./explorer-proof-of-salary/explorer-proof-of-salary').then(
            (m) => m.ExplorerProofOfSalary
          ),
      },
      {
        path: 'add',
        loadComponent: () =>
          import('./add-proof-of-salary/add-proof-of-salary').then((m) => m.AddProofOfSalary),
      },
    ],
  },
];
