import { BaseComponent, FormMode, IPaginationInfo, SectionWrapper } from '@/components';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Validators, FormGroup, FormControl, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { PaginatorState } from 'primeng/paginator';
import { FinancialAccountService, FinancialAccountSearchEnum } from '../../services/financial-account-service';
import { JournalEntryService } from '../../services/journal-entry-service';
import { ITreeFinancialAccountSearchRow, IJournalEntryReadResponse, IFinancialAccountSearchRow } from '../../types';
import { A4PrintService } from '@/core';
import { AllowNumbers } from '@/directives/allow-numbers';
import {
  InputErrorMessageHandler,
  labeledRegexValidator,
  noSymbolsAllowed,
  onlyArLettersAllowed,
  onlyNumbersAllowed,
  onlyNumbersOrDotAllowed,
  onlyNumbersOrEnLettersAllowed,
} from '@/yn-ng';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Button, ButtonDirective } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ControlsOf } from '@/yn-ng/types/helpers';

interface IAppJournalItem {
  finincalAccountId: number | null;
  debtorAmount: number;
  creditorAmount: number;
  notes: string | null;
}
type IAppJournalItemControls = ControlsOf<IAppJournalItem>;

@Component({
  selector: 'app-journal-form',
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
    ButtonDirective,
  ],
  templateUrl: './journal-form.html',
  styleUrl: './journal-form.css',
})
export class JournalForm extends BaseComponent {
  id = input.required<number>();

  currentJournal = signal<IJournalEntryReadResponse | null>(null);
  journalEntryService = inject(JournalEntryService);
  a4PrintService = inject(A4PrintService);
  formMode = computed(() => {
    if (this.currentJournal()) return FormMode.Update;
    return this.initialFormMode();
  });
  //
  //
  //
  //
  //
  //
  //
  //
  //

  initialFormValue = {
    // رقم القيد
    id: this.fb.control<number | null>({ value: null, disabled: true }, []),
    // المرجع
    refNumber: this.fb.control<string | null>(null, [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(16),
      labeledRegexValidator(
        /^[a-zA-Z0-9-]*$/,
        'مسموح فقط بالارقام والحروف الانجليزية و "-"',
        'only numbers or english letters or "-" allowed',
      ),
    ]),
    // الرقم الدفتري
    voucherNo: this.fb.control<string | null>(null, [
      Validators.required,
      onlyNumbersAllowed,
      Validators.minLength(2),
      Validators.maxLength(7),
    ]),
    voucherDate: this.fb.control<Date | null>(new Date(), [Validators.required]),
    notes: this.fb.control<string | null>(null, [ Validators.maxLength(1000)]),
    items: this.fb.array<FormGroup<IAppJournalItemControls>>([], [Validators.required, Validators.minLength(1)]),
  };
  fg = this.fb.group(this.initialFormValue);

  private _formChange = toSignal(this.fg.valueChanges, { initialValue: null });

  totalDebit = computed(() => {
    this._formChange();
    return this.fg.controls.items.controls.reduce((sum, ctrl) => sum + (Number(ctrl.value.debtorAmount) || 0), 0);
  });

  totalCredit = computed(() => {
    this._formChange();
    return this.fg.controls.items.controls.reduce((sum, ctrl) => sum + (Number(ctrl.value.creditorAmount) || 0), 0);
  });

  isBalanced = computed((): boolean | null => {
    this._formChange();
    const items = this.fg.controls.items.controls;
    if (items.length === 0) return null;
    return Math.abs(this.totalDebit() - this.totalCredit()) < 0.001;
  });

  balanceDifference = computed(() => Math.abs(this.totalDebit() - this.totalCredit()));

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
    this.searchFinancialAccounts(0);
    this.setUpNewJournalDetailsRowFg();

    // Date field must never be empty — restore to today if user clears it
    this.fg.controls.voucherDate.valueChanges.subscribe((value) => {
      if (!value) {
        this.fg.controls.voucherDate.setValue(new Date(), { emitEvent: false });
      }
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

  ngOnInit() {
    switch (this.formMode()) {
      case FormMode.Create:
        break;
      case FormMode.Update:
        this.debouncedJournalSearch(this.id().toString());
        break;
    }
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

  onSubmitJournal() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    const journalDetailRowsArray = this.fg.controls.items;

    const creditorEntries = journalDetailRowsArray.value.filter((a) => (a.creditorAmount ?? 0) > 0);
    const debtorEntries = journalDetailRowsArray.value.filter((a) => (a.debtorAmount ?? 0) > 0);

    //check if debtor or creditor is empty
    if (creditorEntries.length == 0 || debtorEntries.length == 0) {
      this.fg.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'يجب ادخال قيمة المدين و الدائن' });
      return;
    }

    //check if debtor sum == creditor sum
    const creditorSum = creditorEntries.reduce((a, b) => a + (Number(b.creditorAmount) || 0), 0);
    const debtorSum = debtorEntries.reduce((a, b) => a + (Number(b.debtorAmount) || 0), 0);

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
      debitJournalEntryDetailsRequestDtos: debtorEntries.map((d) => ({
        finincalAccountId: d.finincalAccountId,
        isHasTax: false,
        totalAmount: d.debtorAmount,
        notes: d.notes,
      })),
      creditJournalEntryDetailsRequestDtos: creditorEntries.map((c) => ({
        finincalAccountId: c.finincalAccountId,
        isHasTax: false,
        totalAmount: c.creditorAmount,
        notes: c.notes,
      })),
    };

    switch (this.formMode()) {
      case FormMode.Create:
        this.journalEntryService.create(data).subscribe({
          next: () => {
            this.onNewJournal();
          },
        });
        break;
      case FormMode.Update:
        this.journalEntryService
          .put({
            id: this.currentJournal()?.id,
            ...data,
          })
          .subscribe({
            next: () => {
              this.onNewJournal();
            },
          });
        break;
    }
  }

  onResetJournal() {
    this.fg.reset();
    this.fg.setControl('items', this.fb.array<FormGroup<IAppJournalItemControls>>([]));
    this.currentJournal.set(null);
  }

  onNewJournal() {
    this.onResetJournal();
    this.router.navigate(['/accounts/journals/add']);
  }

  deleteJournal(event: Event) {
    const journal = this.currentJournal();
    if (!journal) return;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل أنت متأكد من حذف القيد؟',
      header: 'حذف القيد',
      icon: 'pi pi-info-circle',
      rejectLabel: 'إلغاء',
      rejectButtonProps: {
        label: 'إلغاء',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'حذف',
        severity: 'danger',
      },
      accept: () => {
        this.journalEntryService.delete(journal.id).subscribe({
          next: () => {
            this.router.navigate(['/accounts/journals/add']);
          },
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'إلغاء', detail: 'تم إلغاء الحذف' });
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
  // accounts
  //

  currentAccount = signal<{ id: number; name: string } | null>(null);
  _financialAccounts = signal<ITreeFinancialAccountSearchRow[]>([]);
  financialAccounts = computed(() => this._financialAccounts().map(a=>({
    ...a,label:`${a.name} - ${a.finNumber}`,
  })));
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
  debouncedJournalSearch(id: string) {
    if (!id) return;

    this.journalEntryService.getById(+id).subscribe({
      next: (data) => {
        this.currentJournal.set(data);
        this.fg.patchValue({
          id: data.id,
          refNumber: data.refNumber,
          voucherNo: data.voucherNo,
          voucherDate: new Date(data.voucherDate),
          notes: data.notes,
        });
        this.fg.setControl(
          'items',
          this.fb.array<FormGroup<IAppJournalItemControls>>([
            ...data.creditLines.map((a) =>
              this.createNewJournalDetailsItemFg({
                finincalAccountId: a.finincalAccountId,
                creditorAmount: a.totalAmount,
                debtorAmount: 0,
                notes: a.notes,
              }),
            ),
            ...data.debitLines.map((a) =>
              this.createNewJournalDetailsItemFg({
                finincalAccountId: a.finincalAccountId,
                creditorAmount: 0,
                debtorAmount: a.totalAmount,
                notes: a.notes,
              }),
            ),
          ]),
        );
      },
    });
  }

  searchFinancialAccounts(pageIndex: number, searchValue: string = '') {
    this.financialAccountService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 0,
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
          // if (res.value.rows.length === 0) return;
          // if (pageIndex == 1) {
            this._financialAccounts.set(res.value.rows);
          // } else {
          //   this.financialAccounts.update((pre) => [...pre, ...res.value.rows]);
          // }
          // this.financialAccountsPaginationInfo = {
          //   pageIndex,
          //   totalPagesCount: res.value.paginationInfo.totalPagesCount,
          //   totalRowsCount: res.value.paginationInfo.totalRowsCount,
          // };
        },
      });
  }
  filterFinancialAccounts(term: string, item: IFinancialAccountSearchRow) {
        return (
          item.name.toLowerCase().includes(term.toLowerCase()) ||
          item.finNumber.toLowerCase().includes(term.toLowerCase()) ||
          String(item.id).includes(term.toLowerCase())
        );
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

  lastClickedTableRowIndex = signal<number | null>(null);

  delteJournalDetailRow(rowIndex: number) {
    this.fg.controls.items.removeAt(rowIndex);
  }

  /**
   * Strip leading zeros and cap to 2 decimal places.
   * Examples: "00005.55" → 5.55 | "010" → 10 | "0.25" → 0.25
   * Uses emitEvent:false to avoid triggering the mutual-zero subscriptions.
   */
  normalizeAmount(control: AbstractControl) {
    const num = parseFloat(String(control.value ?? 0));
    if (isNaN(num) || num < 0) {
      control.setValue(0, { emitEvent: false });
      return;
    }
    control.setValue(parseFloat(num.toFixed(2)), { emitEvent: false });
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
  newJournalDetailsItemFg!: FormGroup<IAppJournalItemControls>;

  createNewJournalDetailsItemFg(data?: IAppJournalItem) {
    const fg = this.fb.group<IAppJournalItemControls>({
      creditorAmount: this.fb.control<number>(data?.creditorAmount ?? 0, [Validators.required,onlyNumbersOrDotAllowed]),
      debtorAmount: this.fb.control<number>(data?.debtorAmount ?? 0, [Validators.required,onlyNumbersOrDotAllowed]),
      notes: this.fb.control<string | null>(data?.notes ?? null, [  Validators.maxLength(1000)]),
      finincalAccountId: this.fb.control<number | null>(data?.finincalAccountId ?? null, [Validators.required]),
    });

    const creditorAmountControl = fg.controls.creditorAmount;
    const debtorAmountControl = fg.controls.debtorAmount;

    creditorAmountControl.valueChanges.subscribe((creditorAmount) => {
      debtorAmountControl.setValue(0, { emitEvent: false });
    });
    debtorAmountControl.valueChanges.subscribe((debtorAmount) => {
      creditorAmountControl.setValue(0, { emitEvent: false });
    });

    return fg;
  }

  setUpNewJournalDetailsRowFg() {
    if (this.newJournalDetailsItemFg) {
      this.newJournalDetailsItemFg.reset();
    } else {
      this.newJournalDetailsItemFg = this.createNewJournalDetailsItemFg();
    }
  }

  submitNewJournalDetailsItem() {
    this.normalizeAmount(this.newJournalDetailsItemFg.controls.debtorAmount);
    this.normalizeAmount(this.newJournalDetailsItemFg.controls.creditorAmount);

    if (this.newJournalDetailsItemFg.invalid) {
      this.newJournalDetailsItemFg.markAllAsTouched();
      //log errors
      Object.entries(this.newJournalDetailsItemFg.controls!).forEach(([key, value]) => {
        if (value.errors) {
          console.log(key, value.errors);
        }
      });
      return;
    }

    const debitorAmount = this.newJournalDetailsItemFg.value.debtorAmount ?? 0;
    const creditorAmount = this.newJournalDetailsItemFg.value.creditorAmount ?? 0;
    if (debitorAmount == 0 && creditorAmount == 0) {
      this.newJournalDetailsItemFg.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'يجب ادخال قيمة المدين او الدائن' });
      return;
    }

    const fgValue = this.newJournalDetailsItemFg.value;

    this.fg.controls.items!.push(this.createNewJournalDetailsItemFg(fgValue as IAppJournalItem));

    this.lastClickedTableRowIndex.set(this.fg.value.items!.length - 1);
    this.setUpNewJournalDetailsRowFg();
  }

  printJournal() {
    const journal = this.currentJournal();
    if (!journal) return;

    const fmt = (dateStr: string) => {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };
    const money = (v: number) => v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const isBalanced = Math.abs(journal.totalDebit - journal.totalCredit) < 0.001;

    // Combine debit then credit lines, tag each with side label
    const allLines = [
      ...journal.debitLines.map(l => ({ ...l, side: 'مدين' })),
      ...journal.creditLines.map(l => ({ ...l, side: 'دائن' })),
    ];

    const lineRows = allLines.map((line, i) => `
      <tr>
        <td class="num">${i + 1}</td>
        <td>${line.finincalAccountName ?? '-'}</td>
        <td>${line.notes ?? '-'}</td>
        <td class="num">${line.side === 'مدين' ? money(line.totalAmount) : '-'}</td>
        <td class="num">${line.side === 'دائن' ? money(line.totalAmount) : '-'}</td>
      </tr>`).join('');

    const html = `
      <!-- ── Header ── -->
      <div class="doc-header">
        <div class="doc-logo">🏛️</div>
        <div class="doc-company">
          <div class="doc-company-name">Rest House</div>
          <div class="doc-company-sub">نظام إدارة المطاعم والحسابات</div>
        </div>
        <div class="doc-title-box">سند قيد يومية</div>
      </div>

      <!-- ── Meta fields ── -->
      <div class="meta-grid">
        <div class="meta-field">
          <span class="meta-label">رقم القيد:</span>
          <span class="meta-value">${journal.id}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">الرقم الدفتري:</span>
          <span class="meta-value">${journal.voucherNo ?? '-'}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">التاريخ:</span>
          <span class="meta-value">${fmt(journal.voucherDate)}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">المرجع:</span>
          <span class="meta-value">${journal.refNumber ?? '-'}</span>
        </div>
      </div>

      <!-- ── General statement ── -->
      ${journal.notes ? `
      <div class="statement-banner mb-2">
        <span class="meta-label">البيان العام: </span>
        <span>${journal.notes}</span>
      </div>` : ''}

      <!-- ── Lines table ── -->
      <table class="lines-table">
        <thead>
          <tr>
            <th style="width:4%">#</th>
            <th style="width:28%">الحساب</th>
            <th style="width:36%">البيان</th>
            <th style="width:16%">مدين</th>
            <th style="width:16%">دائن</th>
          </tr>
        </thead>
        <tbody>${lineRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="bold">الإجمالي</td>
            <td class="num bold">${money(journal.totalDebit)}</td>
            <td class="num bold">${money(journal.totalCredit)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- ── Totals / balance ── -->
      <div class="totals-box">
        <div class="total-item">
          <span class="total-label">إجمالي المدين</span>
          <span class="total-value">${money(journal.totalDebit)}</span>
        </div>
        <div class="total-item">
          <span class="total-label">إجمالي الدائن</span>
          <span class="total-value">${money(journal.totalCredit)}</span>
        </div>
        <div class="total-item">
          <span class="total-label">الحالة</span>
          <span class="${isBalanced ? 'balance-ok' : 'balance-err'}" style="font-size:11pt;font-weight:bold">
            ${isBalanced ? '✓ متوازن' : '✗ غير متوازن'}
          </span>
        </div>
      </div>

      <!-- ── Signature footer ── -->
      <div class="sig-footer">
        <div class="sig-row">
          <div class="sig-box">
            <span class="sig-title">المحاسب</span>
            <div class="sig-line"></div>
            <span class="sig-name">التوقيع / الاسم</span>
          </div>
          <div class="sig-box">
            <span class="sig-title">المراجع</span>
            <div class="sig-line"></div>
            <span class="sig-name">التوقيع / الاسم</span>
          </div>
          <div class="sig-box">
            <span class="sig-title">مدير الحسابات</span>
            <div class="sig-line"></div>
            <span class="sig-name">التوقيع / الاسم</span>
          </div>
          <div class="sig-box">
            <span class="sig-title">اعتماد الإدارة</span>
            <div class="sig-line"></div>
            <span class="sig-name">التوقيع / الختم</span>
          </div>
        </div>
      </div>`;

    this.a4PrintService.print(html);
  }
}
