import { CanActivateFn, Router } from '@angular/router';
import { DailyJournalService } from '../services/daily-journal-service';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export const canCloseCurrentUserDailyGuard: CanActivateFn = async(route, state) => {
  const dailyJournalService = inject(DailyJournalService);
  dailyJournalService.currentUserId = dailyJournalService.userId;
  
  let router = inject(Router);
  const result = await firstValueFrom(dailyJournalService.getCurrentUserDaily());
  if(!result.isOpening){
    //can only open
    router.navigateByUrl('/daily-journal/open-daily-journal');
  }
  return result.isOpening;
};
