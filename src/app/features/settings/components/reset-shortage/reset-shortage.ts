import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject, signal } from '@angular/core';
import { DailyJournalService, IUserDailyJournalResponse } from '../../services/daily-journal-service';
import { DatePipe } from '@angular/common';
import { InputErrorMessageHandler } from '@/yn-ng';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-shortage',
  templateUrl: './reset-shortage.html',
  styleUrl: './reset-shortage.css',
  imports: [DatePipe, InputErrorMessageHandler, InputText, Textarea, ReactiveFormsModule],
})
export class ResetShortage extends BaseComponent {
  dailyJournalService = inject(DailyJournalService);
  shortages = signal<IUserDailyJournalResponse['value']['shortage']>([]);

  initialFgValue = {
    cashClosingAmount: this.fb.control<number>(0, [Validators.required]),
    networkClosingAmount: this.fb.control<number>(0, [Validators.required]),
  };
  fg = this.fb.group(this.initialFgValue);

  constructor() {
    super();
    this.loadShortages();
  }

  private loadShortages() {
    if (!this.dailyJournalService.loggedInUserId) return;

    this.dailyJournalService.getCurrentUserDaily().subscribe({
      next: (res) => {
        // this.shortages.set(res+);
      },
    });
  }
}
