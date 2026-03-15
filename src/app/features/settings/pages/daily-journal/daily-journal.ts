import { BaseComponent, SectionWrapper } from '@/components';
import { Component, inject } from '@angular/core';
import { DailyJournalService } from '../../services/daily-journal-service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-daily-journal',
  imports: [SectionWrapper, RouterOutlet],
  templateUrl: './daily-journal.html',
  styleUrl: './daily-journal.css',
})
export class DailyJournal extends BaseComponent {
  dailyJournalService = inject(DailyJournalService);
  links = this.dailyJournalService.links;
  /**
   *
   */
  constructor() {
    super();
    this.dailyJournalService.currentUserId = this.dailyJournalService.userId;
    this.dailyJournalService.getCurrentUserDaily().subscribe();
  }
}
