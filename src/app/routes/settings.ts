import { Route } from '@angular/router';
import { Printer } from '@/features/settings/pages/printer/printer';
import { Qr } from '@/features/settings/pages/qr/qr';
import { About } from '@/features/settings/pages/about/about';
import { Language } from '@/features/settings/pages/language/language';
import { Support } from '@/features/settings/pages/support/support';
import { DefaultAccounts } from '@/features/settings/pages/default-accounts/default-accounts';
import { AddPrinter } from '@/features/settings/pages/add-printer/add-printer';
import { ManageDailyJournal } from '@/features/settings/pages/manage-daily-journal/manage-daily-journal';
import { Financial } from '@/features/settings/pages/financial/financial';

export default [
  {
    path: 'printer',
    component: Printer,
  },

  {
    path: 'program/about',
    component: About,
  },
  {
    path: 'program/language',
    component: Language,
  },
  {
    path: 'program/support',
    component: Support,
  },
  {
    path: 'qr',
    component: Qr,
  },
  {
    path: 'financial',
    component: Financial,
  },
  {
    path: 'default-accounts',
    component: DefaultAccounts,
  },
  {
    path: 'add-printer',
    component: AddPrinter,
  },
  {
    path: 'manage-daily-journal',
    component: ManageDailyJournal,
  },
] satisfies Route[];
