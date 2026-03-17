import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DailyJournalService } from '../services/daily-journal-service';
import { first, firstValueFrom } from 'rxjs';

export const canOpenCurrentUserDailyGuard: CanActivateFn =async (route, state) => {
  const dailyJournalService = inject(DailyJournalService);
  dailyJournalService.currentUserId = dailyJournalService.loggedInId;
  let router = inject(Router);
  const result = await firstValueFrom(dailyJournalService.getCurrentUserDaily());
  if(result.isOpening){
    //can only close
    router.navigateByUrl('/daily-journal/close-daily-journal');
  }
  return !result.isOpening;

};
