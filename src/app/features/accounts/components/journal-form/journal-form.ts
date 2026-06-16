import { BaseComponent, FormMode, IPaginationInfo, SectionWrapper } from '@/components';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { PaginatorState } from 'primeng/paginator';
import { FinancialAccountService, FinancialAccountSearchEnum } from '../../services/financial-account-service';
import { JournalEntryService } from '../../services/journal-entry-service';
import { ITreeFinancialAccountSearchRow, IJournalEntryReadResponse, IFinancialAccountSearchRow } from '../../types';
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
import { RouterLink } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';

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
    InputErrorMessageHandler,
    Textarea,
    InputTextModule,
    DatePickerModule,
    InputGroupAddon,
    ReactiveFormsModule,
    Debounce,
    NgSelectComponent,
    AllowNumbers,
    ButtonDirective,
    RouterLink,
    TooltipModule
  ],
  templateUrl: './journal-form.html',
  styleUrl: './journal-form.css',
})
export class JournalForm extends BaseComponent {
  id = input.required<number>();

  currentJournal = signal<IJournalEntryReadResponse | null>(null);
  journalEntryService = inject(JournalEntryService);
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
          next: (data) => {
            this.onResetJournal();
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
            next: (data) => {
              this.onResetJournal();
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

  currentEditRowIndex = signal<number>(-1);

  editJournalDetailRow(rowIndex: number) {
    this.lastClickedTableRowIndex.set(rowIndex + 1);
    this.currentEditRowIndex.set(rowIndex);
  }
  isRowEditable(rowIndex: number) {
    return this.currentEditRowIndex() === rowIndex;
  }
  delteJournalDetailRow(rowIndex: number) {
    this.fg.controls.items.removeAt(rowIndex);
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
    onResetForm() {
    if(this.formMode() === FormMode.Create){
      this.fg.reset();
    }else{
      this.router.navigateByUrl('/accounts/journals/add');
    }
  }
}
