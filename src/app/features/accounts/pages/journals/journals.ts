import { Component, computed, inject, signal } from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Textarea } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { BaseComponent, IPaginationInfo } from '@/components';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IJournalEntryReadResponse, JournalEntryService } from '../../services/journal-entry-service';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { NgSelectComponent } from '@ng-select/ng-select';
import {
  IFinancialAccountSearchResponseValue,
  ITreeFinancialAccountSearchRow,
} from '../../services/financial-account-types';
import { FinancialAccountSearchEnum, FinancialAccountService } from '../../services/financial-account-service';
import { PaginatorState } from 'primeng/paginator';
import { AllowNumbers } from '@/directives/allow-numbers';

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
    AllowNumbers,
    ButtonDirective
],
  templateUrl: './journals.html',
  styleUrl: './journals.css',
})
export class Journals extends BaseComponent {
  currentJournalEntry = signal<IJournalEntryReadResponse | null>(null);
  journalEntryService = inject(JournalEntryService);
  initialFormValue = {
    // المرجع
    refNumber: this.fb.control<string | null>(null, [Validators.required]),
    // الرقم الدفتري
    voucherNo: this.fb.control<string | null>(null, [Validators.required]),
    voucherDate: this.fb.control<Date | null>(null, [Validators.required]),
    paymentMethod: this.fb.control<string | null>(null, [Validators.required]),
    notes: this.fb.control<string | null>(null, [Validators.required, Validators.maxLength(1000)]),
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
  //
  //
  //
  //

  onSubmitJournal() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    const creditorEntries = this.journalDetailRowsArray.value.filter((a) => (a.creditorAmount ?? 0) > 0);
    const debtorEntries = this.journalDetailRowsArray.value.filter((a) => (a.debtorAmount ?? 0) > 0);

    //check if debtor or creditor is empty
    if(creditorEntries.length == 0 || debtorEntries.length == 0) {
      this.fg.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'يجب ادخال قيمة المدين و الدائن' });
      return;
    }

    //check if debtor sum == creditor sum
    const creditorSum = creditorEntries.reduce((a, b) => a + (b.creditorAmount ?? 0), 0);
    const debtorSum = debtorEntries.reduce((a, b) => a + (b.debtorAmount ?? 0), 0);

    if (creditorSum != debtorSum) {
      this.fg.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'القيمتان المدينة والدائنة غير متساويتان',
      });
      return;
    }


    //collect data to send
    let data = {
      ...this.fg.value,
      voucherDate: this.UtcToLocalIso(this.fg.value.voucherDate!.toISOString()),
      debitJournalEntryDetailsRequestDtos: debtorEntries.map(d=>({
        finincalAccountId: d.finincalAccountId,
        isHasTax: false,
        totalAmount: d.debtorAmount,
        notes: d.notes
      })),
      creditJournalEntryDetailsRequestDtos: creditorEntries.map(c=>({
        finincalAccountId: c.finincalAccountId,
        isHasTax: false,
        totalAmount: c.creditorAmount,
        notes: c.notes
      })),
    };

    this.journalEntryService.create(data).subscribe();
  }

  //
  //
  //
  //
  //
  //
  //
  /**
   *
   */
  constructor() {
    super();
    this.searchFinancialAccounts(1);
    this.setUpNewJournalDetailRowFg();
  }

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
  financialAccounts = signal<ITreeFinancialAccountSearchRow[]>([]);
  financialAccountService = inject(FinancialAccountService);
  displayedAccounts = computed(() => {
    const accounts = this.financialAccounts();
    const current = this.currentAccount();

    if (!current) return accounts;

    const exists = accounts.some((g) => g.id === current.id);

    if (exists) {
      return accounts.map((g) => (g.id === current.id ? { ...g, ...current } : g));
    }

    return [current, ...accounts];
  });
  financialAccountsPaginationInfo: IPaginationInfo = {
    pageIndex: 0,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };
  previousAccountSearchValue = '';
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
          voucherDate: new Date(data.voucherDate),
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          isHasTax: data.isHasTax,
          totalAmount: data.totalAmount,
        });
      },
    });
  }

  searchFinancialAccounts(pageIndex: number, searchValue: string = '') {
    this.financialAccountService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 10,
        },
        searchFilters: [
          {
            column: FinancialAccountSearchEnum.Name,
            values: [searchValue],
          },
        ],
        fromDate: null,
      })
      .subscribe({
        next: (res) => {
          if (res.value.rows.length === 0) return;
          if (pageIndex == 1) {
            this.financialAccounts.set(res.value.rows);
          } else {
            this.financialAccounts.update((pre) => [...pre, ...res.value.rows]);
          }
          this.financialAccountsPaginationInfo = {
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  debouncedFinancialAccountsSearch(event: IDebounceEvent, searchValue: string) {
    console.log(event);
    if (event.type === 'scrollToEnd') {
      this.searchFinancialAccounts(this.financialAccountsPaginationInfo.pageIndex + 1);
    } else {
      this.searchFinancialAccounts(1, searchValue);
    }
  }

  onSubmit = () => this.fg.valid && this.searchFinancialAccounts(1);

  onPageChange = (event: PaginatorState) => this.searchFinancialAccounts(event.page! + 1);
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

  journalDetailRowsArray = this.fb.array<typeof this.newJournalDetailRowFg>([]);
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

  lastClickedTableRowIndex = signal<number | null>(null);

  currentEditRowIndex = signal<number>(-1);

  editJournalDetailRow(rowIndex: number) {
    this.lastClickedTableRowIndex.set(rowIndex + 1);
    this.currentEditRowIndex.set(rowIndex);
  }
  isRowEditable(rowIndex: number) {
    return this.currentEditRowIndex() === rowIndex;
  }
  delteJournalDetailRow(rowIndex: number) {
    this.journalDetailRowsArray.removeAt(rowIndex);
    this.currentEditRowIndex.set(-1);
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
  //
  newJournalDetailRowFg!: FormGroup<{
    finincalAccountId: FormControl<number | null>;
    debtorAmount: FormControl<number>;
    creditorAmount: FormControl<number>;
    notes: FormControl<string | null>;
  }>;

  setUpNewJournalDetailRowFg() {
    this.newJournalDetailRowFg = this.fb.group({
      finincalAccountId: this.fb.control<number | null>(null, [Validators.required]),
      debtorAmount: this.fb.control<number>(0, [Validators.required]),
      creditorAmount: this.fb.control<number>(0, [Validators.required]),
      notes: this.fb.control<string | null>(null, [Validators.required]),
    });
    const newJournalDetailRowFgValue = this.newJournalDetailRowFg;
    const creditorAmountControl = newJournalDetailRowFgValue.controls.creditorAmount;
    const debtorAmountControl = newJournalDetailRowFgValue.controls.debtorAmount;
    creditorAmountControl.valueChanges.subscribe((creditorAmount) => {
      debtorAmountControl.setValue(0, { emitEvent: false });
    });
    debtorAmountControl.valueChanges.subscribe((debtorAmount) => {
      creditorAmountControl.setValue(0, { emitEvent: false });
    });
  }

  addNewJournalDetailRow() {
    if (this.newJournalDetailRowFg.invalid) {
      this.newJournalDetailRowFg.markAllAsTouched();
      return;
    }
    const debitorAmount = this.newJournalDetailRowFg.value.debtorAmount ?? 0;
    const creditorAmount = this.newJournalDetailRowFg.value.creditorAmount ?? 0;
    if (debitorAmount == 0 && creditorAmount == 0) {
      this.newJournalDetailRowFg.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'يجب ادخال قيمة المدين او الدائن' });
      return;
    }
    this.journalDetailRowsArray.push(this.newJournalDetailRowFg);
    this.lastClickedTableRowIndex.set(this.journalDetailRowsArray.length - 1);
    this.setUpNewJournalDetailRowFg();
  }
}
