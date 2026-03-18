import { BaseComponent, SectionWrapper } from '@/components';
import { Component, computed, inject, signal } from '@angular/core';
import { DailyJournalService } from '../../services/daily-journal-service';
import { RouterOutlet } from '@angular/router';
import { OpenDailyJournal } from '../../components/open-daily-journal/open-daily-journal';
import { CloseDailyJournal } from '../../components/close-daily-journal/close-daily-journal';

@Component({
  selector: 'app-daily-journal',
  imports: [SectionWrapper, RouterOutlet, OpenDailyJournal, CloseDailyJournal],
  templateUrl: './daily-journal.html',
  styleUrl: './daily-journal.css',
})
export class DailyJournal extends BaseComponent {
  dailyJournalService = inject(DailyJournalService);
  links = this.dailyJournalService.links;

  isOpenState = computed<boolean>(() =>
    Boolean(this.dailyJournalService?.currentUserDaily()?.value.dailyJournalPeriods.isOpening),
  );

  /**
   *
   */
  constructor() {
    super();
    this.dailyJournalService.currentUserId = this.dailyJournalService.loggedInUserId;
    this.dailyJournalService.getUserDaily(this.dailyJournalService.loggedInUserId).subscribe({
      next: (res) => {
        this.dailyJournalService.currentUserDaily.set(res);
      },
    });
  }
}
