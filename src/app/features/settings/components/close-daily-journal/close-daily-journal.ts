import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { InputErrorMessageHandler } from '@/yn-ng';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { DailyJournalService } from '../../services/daily-journal-service';

@Component({
  selector: 'app-close-daily-journal',
  templateUrl: './close-daily-journal.html',
  styleUrl: './close-daily-journal.css',
  imports: [InputErrorMessageHandler, InputText, Textarea,ReactiveFormsModule],
})
export class CloseDailyJournal extends BaseComponent {
  initialFgValue = {
    cashClosingAmount: this.fb.control<number>(0, [Validators.required]),
    networkClosingAmount: this.fb.control<number>(0, [Validators.required]),
  };
  fg = this.fb.group(this.initialFgValue);
  constructor() {
    super();
  }

  dailyJournalService = inject(DailyJournalService);

  onSubmitOrder() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    this.dailyJournalService.closeDailySession(this.fg.value as any).subscribe();
  }
}
