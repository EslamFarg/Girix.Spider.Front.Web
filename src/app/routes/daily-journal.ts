import { Route } from '@angular/router';
import { OpenDailyJournal } from '@/features/settings/components/open-daily-journal/open-daily-journal';
import { CloseDailyJournal } from '@/features/settings/components/close-daily-journal/close-daily-journal';
import { ResetShortage } from '@/features/settings/components/reset-shortage/reset-shortage';
import { DailyJournal } from '@/features/settings/pages/daily-journal/daily-journal';
import { canOpenCurrentUserDailyGuard } from '@/features/settings/guards/can-open-current-user-daily-guard';
import { canCloseCurrentUserDailyGuard } from '@/features/settings/guards/can-close-current-user-daily-guard';
7;

export default [
  {
    path: '',
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
        canActivate: [canOpenCurrentUserDailyGuard],
      },
      {
        path: 'close-daily-journal',
        component: CloseDailyJournal,
        canActivate:[canCloseCurrentUserDailyGuard]
      },
      {
        path: 'reset-shortage',
        component: ResetShortage,
        canActivate:[canCloseCurrentUserDailyGuard]
      },
    ],
  },
] satisfies Route[];
