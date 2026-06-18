import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { InputErrorMessageHandler, onlyNumbersOrDotAllowed } from '@/yn-ng';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { DailyJournalService } from '../../services/daily-journal-service';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonDirective } from 'primeng/button';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";

@Component({
  selector: 'app-close-daily-journal',
  templateUrl: './close-daily-journal.html',
  styleUrl: './close-daily-journal.css',
  imports: [InputErrorMessageHandler, InputText, Textarea, ReactiveFormsModule, TranslatePipe, ButtonDirective, LoadingDisabledDirective],
})
export class CloseDailyJournal extends BaseComponent {
  initialFgValue = {
    cashClosingAmount: this.fb.control<number>(0, [Validators.required,onlyNumbersOrDotAllowed]),
    networkClosingAmount: this.fb.control<number>(0, [Validators.required,onlyNumbersOrDotAllowed]),
    closingNotes: this.fb.control<string | null>(null, [Validators.maxLength(200)]),
    closingDate: this.fb.control(this.localDateIso, []),
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

    this.dailyJournalService.closeUserDailySession(this.fg.value as any).subscribe({
      next: () => {
        this.dailyJournalService.getUserDaily(this.dailyJournalService.currentUserId).subscribe({
          next: (res) => {
            this.dailyJournalService.currentUserDaily.set(res);
          },
        });
      },
    });
  }
}
