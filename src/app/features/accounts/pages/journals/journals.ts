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
import { JournalEntryService } from '../../services/journal-entry-service';
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
  journalEntryService = inject(JournalEntryService);
  initialFormValue = {
    voucherNo: this.fb.control<string | null>(null, [Validators.required]),
    voucherDate: this.fb.control<string | null>(null, [Validators.required]),
    paymentMethod: this.fb.control<string | null>(null, [Validators.required]),
    notes: this.fb.control<string | null>(null, [Validators.required]),
    isHasTax: this.fb.control<string | null>(null, [Validators.required]),
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
    this.journalEntryService.getById(voucherNo as any).subscribe();
  }

  debouncedVoucherSearch(event: any) {
    console.log(event);
    const searchValue = event?.term ?? '';
    this.searchVoucher(searchValue);
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
