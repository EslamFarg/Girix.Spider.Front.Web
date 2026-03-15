import { Route } from '@angular/router';
import { OpenDailyJournal } from '@/features/settings/components/open-daily-journal/open-daily-journal';
import { CloseDailyJournal } from '@/features/settings/components/close-daily-journal/close-daily-journal';
import { ResetShortage } from '@/features/settings/components/reset-shortage/reset-shortage';
import { DailyJournal } from '@/features/settings/pages/daily-journal/daily-journal';

export default [
  {
    path: '',
    pathMatch: 'full',
    component: DailyJournal,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'open-daily-journal',
      },
      {
        path: 'open-daily-journal',
        component: OpenDailyJournal,
      },
      {
        path: 'close-daily-journal',
        component: CloseDailyJournal,
      },
      {
        path: 'reset-shortage',
        component: ResetShortage,
      },
    ],
  },
] satisfies Route[];
