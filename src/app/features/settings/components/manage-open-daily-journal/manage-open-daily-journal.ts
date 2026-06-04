import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { InputErrorMessageHandler } from '@/yn-ng';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { DailyJournalService } from '../../services/daily-journal-service';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonDirective } from 'primeng/button';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";

@Component({
  selector: 'app-manage-open-daily-journal',
  templateUrl: './manage-open-daily-journal.html',
  styleUrl: './manage-open-daily-journal.css',
  imports: [InputErrorMessageHandler, InputText, Textarea, TranslatePipe, ButtonDirective, ReactiveFormsModule, LoadingDisabledDirective],
})
export class ManageOpenDailyJournal extends BaseComponent {
  dailyJournalService = inject(DailyJournalService);
  currentUserDaily = this.dailyJournalService.currentUserDaily;

  initialFgValue = {
    custodyBalance: this.fb.control<number>(0, [Validators.required]),
    openingNotes: this.fb.control<string | null>(null, []),
    dateTime: this.fb.control(this.localDateIso, []),
  };
  fg = this.fb.group(this.initialFgValue);


  constructor() {
    super();
  }

  onSubmitOpenDaily() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    this.dailyJournalService.openUserDailySession(this.fg.value as never).subscribe({
      next: () => {
        this.dailyJournalService.getUserDaily().subscribe({
          next: (res) => {
            this.dailyJournalService.currentUserDaily.set(res);
          },
        });
      },
    });
  }
}
