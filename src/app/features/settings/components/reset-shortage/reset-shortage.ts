import { DatePipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { DailyJournalService, IUserDailyJournalResponse } from '../../services/daily-journal-service';

@Component({
  selector: 'app-reset-shortage',
  templateUrl: './reset-shortage.html',
  styleUrl: './reset-shortage.css',
  imports: [DatePipe],
})
export class ResetShortage {
  dailyJournalService = inject(DailyJournalService);
  shortages = signal<IUserDailyJournalResponse['value']['shortage']>([]);

  constructor() {
    effect(() => {
      this.shortages.set(this.dailyJournalService.currentUserDaily()?.value?.shortage ?? []);
    });
  }
}
