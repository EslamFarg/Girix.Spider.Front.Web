import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { InputErrorMessageHandler } from '@/yn-ng';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { DailyJournalService } from '../../services/daily-journal-service';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-close-daily-journal',
  templateUrl: './close-daily-journal.html',
  styleUrl: './close-daily-journal.css',
  imports: [InputErrorMessageHandler, InputText, Textarea, ReactiveFormsModule, TranslatePipe, ButtonDirective],
})
export class CloseDailyJournal extends BaseComponent {
  initialFgValue = {
    cashClosingAmount: this.fb.control<number>(0, [Validators.required]),
    networkClosingAmount: this.fb.control<number>(0, [Validators.required]),
    closingNotes: this.fb.control<string | null>(null, [Validators.required]),
    closingDate: this.fb.control(this.dateNowIso, []),
  };
  fg = this.fb.group(this.initialFgValue);
  constructor() {
    super();
  }

  dailyJournalService = inject(DailyJournalService);
  currentUserDaily = this.dailyJournalService.currentUserDaily;

  onCloseDaily() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    this.dailyJournalService.closeUserDailySession(this.fg.value as any).subscribe();
  }
}
