import { Route } from '@angular/router';
import { Printer } from '@/features/settings/pages/printer/printer';
import { Qr } from '@/features/settings/pages/qr/qr';
import { About } from '@/features/settings/pages/about/about';
import { Language } from '@/features/settings/pages/language/language';
import { Support } from '@/features/settings/pages/support/support';
import { DefaultAccounts } from '@/features/settings/pages/default-accounts/default-accounts';
import { AddPrinter } from '@/features/settings/pages/add-printer/add-printer';
import { AddOpeningBalances } from '@/features/storage/pages/add-opening-balances/add-opening-balances';
import { DailyOpeningClosing } from '@/features/settings/pages/daily-opening-closing/daily-opening-closing';
import { Financial } from '@/features/settings/pages/financial/financial';
  
 

export default [
  {
    path: 'printer',
    component: Printer,
  },
  
  //program
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
  //
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
    path: 'daily-opening-closing',
    component: DailyOpeningClosing,
  },
] satisfies Route[];
