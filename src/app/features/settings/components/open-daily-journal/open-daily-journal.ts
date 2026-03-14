import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { InputErrorMessageHandler } from '@/yn-ng';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Validators } from '@angular/forms';
import { DailyJournalService } from '../../services/daily-journal-service';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonDirective } from "primeng/button";

@Component({
  selector: 'app-open-daily-journal',
  templateUrl: './open-daily-journal.html',
  styleUrl: './open-daily-journal.css',
  imports: [InputErrorMessageHandler, InputText, Textarea, TranslatePipe, ButtonDirective],
})
export class OpenDailyJournal extends BaseComponent {
  initialFgValue = {
    custodyBalance: this.fb.control<number>(0, [Validators.required]),
    openingNotes: this.fb.control<string | null>(null, [Validators.required]),
    dateTime: this.fb.control(this.dateNowIso, [Validators.required]),
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

    this.dailyJournalService.openDailySession(this.fg.value as any).subscribe();
  }
}
