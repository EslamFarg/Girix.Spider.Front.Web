import { Component, computed, inject, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Textarea } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { BaseComponent, IPaginationInfo } from '@/components';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { IJournalEntryReadResponse, JournalEntryService } from '../../services/journal-entry-service';
import { Debounce } from '@/directives/debounce';
import { NgSelectComponent } from '@ng-select/ng-select';
import {
  IFinancialAccountSearchResponseValue,
  ITreeFinancialAccountSearchRow,
} from '../../services/financial-account-types';
import { FinancialAccountService } from '../../services/financial-account-service';

@Component({
  selector: 'app-journals',
  imports: [
    Button,
    InputErrorMessageHandler,
    Textarea,
    InputTextModule,
    DatePickerModule,
    InputGroupAddon,
    SectionWrapper,
    ReactiveFormsModule,
    Debounce,
    NgSelectComponent,
  ],
  templateUrl: './journals.html',
  styleUrl: './journals.css',
})
export class Journals extends BaseComponent {
  currentJournalEntry = signal<IJournalEntryReadResponse | null>(null);
  journalEntryService = inject(JournalEntryService);
  initialFormValue = {
    refNumber: this.fb.control<string | null>(null, [Validators.required]),
    voucherNo: this.fb.control<string | null>(null, [Validators.required]),
    voucherDate: this.fb.control<string | null>(null, [Validators.required]),
    paymentMethod: this.fb.control<string | null>(null, [Validators.required]),
    notes: this.fb.control<string | null>(null, [Validators.required]),
    isHasTax: this.fb.control<boolean>(false, [Validators.required]),
    totalAmount: this.fb.control<number | null>(null, [Validators.required]),
  };
  fg = this.fb.group(this.initialFormValue);

  //
  //
  //
  //
  //
  //
  //
  //
  // accounts
  //

  currentAccount = signal<{ id: number; name: string } | null>(null);
  accounts = signal<ITreeFinancialAccountSearchRow[]>([]);
  accountService = inject(FinancialAccountService);
  displayedAccounts = computed(() => {
    const accounts = this.accounts();
    const current = this.currentAccount();

    if (!current) return accounts;

    const exists = accounts.some((g) => g.id === current.id);

    if (exists) {
      return accounts.map((g) => (g.id === current.id ? { ...g, ...current } : g));
    }

    return [current, ...accounts];
  });
  printersPaginationInfo: IPaginationInfo = {
    pageIndex: 0,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };
  previousSearchValue = '';
  searchVoucher(voucherNo: string) {
    return this.journalEntryService.getById(voucherNo as any);
  }

  debouncedVoucherSearch(event: any, voucherNo: string) {
    console.log(event);
    if (!voucherNo) return;
    this.searchVoucher(voucherNo).subscribe({
      next: (data) => {
        this.currentJournalEntry.set(data);
        this.fg.patchValue({
          refNumber: data.refNumber,
          voucherNo: data.voucherNo,
          voucherDate: data.voucherDate,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          isHasTax: data.isHasTax,
          totalAmount: data.totalAmount,
        });
      },
    });
  }
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  journalDetailRowsArray = this.fb.array([
    this.fb.group({
      finincalAccountId: this.fb.control<number | null>(null, [Validators.required]),
      isHasTax: this.fb.control(false, [Validators.required]),
      totalAmount: this.fb.control<number>(0, [Validators.required]),
      notes: this.fb.control<string | null>(null, [Validators.required]),
    }),
  ]);
}
