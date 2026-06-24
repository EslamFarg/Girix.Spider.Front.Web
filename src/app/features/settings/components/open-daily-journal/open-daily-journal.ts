import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { InputErrorMessageHandler, onlyNumbersOrDotAllowed } from '@/yn-ng';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Validators, ɵInternalFormsSharedModule, ReactiveFormsModule } from '@angular/forms';
import { DailyJournalService } from '../../services/daily-journal-service';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonDirective } from 'primeng/button';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";
import { AllowNumbers } from "@/directives/allow-numbers";
import { DecimalMask } from "@/directives/decimal-mask";
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-open-daily-journal',
  templateUrl: './open-daily-journal.html',
  styleUrl: './open-daily-journal.css',
  imports: [InputErrorMessageHandler, InputText, Textarea, TranslatePipe, ButtonDirective, ɵInternalFormsSharedModule, ReactiveFormsModule, LoadingDisabledDirective, DecimalPipe, AllowNumbers, DecimalMask],
})
export class OpenDailyJournal extends BaseComponent {
  initialFgValue = {
    custodyBalance: this.fb.control<number>(0, [Validators.required,onlyNumbersOrDotAllowed]),
    openingNotes: this.fb.control<string | null>(null, [Validators.maxLength(200)]),
    dateTime: this.fb.control(this.localDateIso, [Validators.required]),
  };
  fg = this.fb.group(this.initialFgValue);

  todayDisplay = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  constructor() {
    super();
  }

  dailyJournalService = inject(DailyJournalService);

  onSubmitOpenDaily() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    this.dailyJournalService.openUserDailySession(this.fg.value as any).subscribe({
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
