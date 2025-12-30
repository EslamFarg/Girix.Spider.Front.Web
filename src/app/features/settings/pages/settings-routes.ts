import { Route } from '@angular/router';
import { Printer } from './printer/printer';
import { Qr } from './qr/qr';
import { About } from './about/about';
import { Language } from './language/language';
import { Support } from './support/support';
import { DefaultAccounts } from './default-accounts/default-accounts';
import { AddPrinter } from './add-printer/add-printer';
import { AddOpeningBalances } from '@/features/storage/pages/add-opening-balances/add-opening-balances';
import { DailyOpeningClosing } from './daily-opening-closing/daily-opening-closing';
import { Financial } from './financial/financial';
  
 

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
