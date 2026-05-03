import { DatePipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { DailyJournalService, IUserDailyJournalResponse } from '../../services/daily-journal-service';
import { Button, ButtonDirective } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-shortage',
  templateUrl: './reset-shortage.html',
  styleUrl: './reset-shortage.css',
  imports: [DatePipe, Button, ButtonDirective,TranslatePipe],
})
export class ResetShortage {
  dailyJournalService = inject(DailyJournalService);
  shortages = signal<IUserDailyJournalResponse['value']['shortage']>([]);

  constructor() {
    effect(() => {
      this.shortages.set(this.dailyJournalService.currentUserDaily()?.value?.shortage ?? []);
    });
  }

  onSubmit() {
    this.dailyJournalService.resetShortage().subscribe({
      next: () => {
        // Refresh the user daily data after successful reset
        const userId = this.dailyJournalService.currentUserId;
        this.dailyJournalService.getUserDaily(userId).subscribe({
          next: (res) => {
            this.dailyJournalService.currentUserDaily.set(res);
          },
        });
      },
    });
  }
}
