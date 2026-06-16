import { BaseComponent, FormMode, IPaginationInfo } from '@/components';
import { AllowNumbers } from '@/directives/allow-numbers';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { InputErrorMessageHandler, onlyNumbersOrDotAllowed } from '@/yn-ng';
import { ControlsOf } from '@/yn-ng/types/helpers';
import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ButtonDirective } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorState } from 'primeng/paginator';
import { Textarea } from 'primeng/textarea';
import { A4PrintService } from '@/core';
import { FinancialAccountSearchEnum, FinancialAccountService } from '../../services/financial-account-service';
import { ReceiptVoucherService } from '../../services/receipt-voucher-service';
import {
  IFinancialAccountSearchRow,
  IReceiptVoucherReadResponse,
  ITreeFinancialAccountSearchRow,
} from '../../types';
import { TooltipModule } from 'primeng/tooltip';

interface IAppReceiptVoucherItem {
  finincalAccountId: number | null;
  isHasTax: boolean;
  totalAmount: number;
  notes: string | null;
}
type IAppReceiptVoucherItemControls = ControlsOf<IAppReceiptVoucherItem>;

type ISelectableBankCashAccount = Omit<IFinancialAccountSearchRow, 'stage'>;

@Component({
  selector: 'app-collective-receipt-form',
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
    TooltipModule,
  ],
  templateUrl: './collective-receipt-form.html',
  styleUrl: './collective-receipt-form.css',
})
export class CollectiveReceiptForm extends BaseComponent {
  id = input.required<number>();
  FinancialAccountSearchEnum = FinancialAccountSearchEnum;
  currentReceiptVoucher = signal<IReceiptVoucherReadResponse | null>(null);
  receiptVoucherService = inject(ReceiptVoucherService);
  a4PrintService = inject(A4PrintService);
  formMode = computed(() => {
    if (this.currentReceiptVoucher()) return FormMode.Update;
    return this.initialFormMode();
  });

  initialFormValue = {
    id: this.fb.control<number | null>({ value: null, disabled: true }, []),
    voucherNo: this.fb.control<string | null>(null, [Validators.required]),
    voucherDate: this.fb.control<Date | null>(new Date(), [Validators.required]),
    debitAccountId: this.fb.control<number | null>(null, [Validators.required]),
    isHasTax: this.fb.control<boolean>(false, []),
    paymentMethod: this.fb.control<string | null>('cash', []),
    notes: this.fb.control<string | null>(null, [Validators.required, Validators.minLength(2), Validators.maxLength(1000)]),
    items: this.fb.array<FormGroup<IAppReceiptVoucherItemControls>>([], [Validators.required, Validators.minLength(1)]),
  };
  fg = this.fb.group(this.initialFormValue);

  private _formChange = toSignal(this.fg.valueChanges, { initialValue: null });

  /** Sum of all line totalAmount values — updates instantly on add/edit/delete */
  totalWithTax = computed(() => {
    this._formChange();
    return this.fg.controls.items.controls.reduce(
      (sum, ctrl) => sum + (Number(ctrl.value.totalAmount) || 0),
      0,
    );
  });

  constructor() {
    super();
    this.searchFinancialAccounts(0);
    this.getCashAndBankAccountsAndCustodyAccounts();
    this.setUpNewReceiptVoucherDetailsRowFg();

    // Date must never become empty — restore today if cleared
    this.fg.controls.voucherDate.valueChanges.subscribe((value) => {
      if (!value) {
        this.fg.controls.voucherDate.setValue(new Date(), { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    switch (this.formMode()) {
      case FormMode.Create:
        break;
      case FormMode.Update:
        this.receiptVoucherService.getById(this.id()).subscribe({
          next: (data) => {
            this.debouncedReceiptVoucherSearch(data.id.toString());
          },
        });
        break;
    }
  }

  onSubmitReceiptVoucher() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    const voucherItems = this.fg.controls.items.getRawValue();
    const totalAmount = voucherItems.reduce((sum, item) => sum + (Number(item?.totalAmount) || 0), 0);

    if (voucherItems.length === 0 || totalAmount <= 0) {
      this.fg.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'يجب إدخال بنود السند بإجمالي أكبر من صفر',
      });
      return;
    }

    const data = {
      voucherNo: this.fg.value.voucherNo!,
      voucherDate: this.UtcToLocalIso(this.fg.value.voucherDate!.toISOString()),
      notes: this.fg.value.notes!,
      debitAccountId: this.fg.value.debitAccountId!,
      isHasTax: this.fg.value.isHasTax ?? false,
      paymentMethod: this.fg.value.paymentMethod!,
      totalAmount: +totalAmount,
      receiptVoucherDetailsRequestDtos: voucherItems.map((item) => ({
        finincalAccountId: item.finincalAccountId!,
        isHasTax: item.isHasTax ?? false,
        totalAmount: +(item.totalAmount ?? 0),
      })),
    };

    switch (this.formMode()) {
      case FormMode.Create:
        this.receiptVoucherService.create(data).subscribe({
          next: () => {
            this.onNewReceiptVoucher();
          },
        });
        break;
      case FormMode.Update:
        this.receiptVoucherService
          .put({
            id: this.currentReceiptVoucher()!.id,
            ...data,
          })
          .subscribe({
            next: () => {
              this.onNewReceiptVoucher();
            },
          });
        break;
    }
  }

  onResetReceiptVoucher() {
    this.fg.reset();
    this.fg.controls.voucherDate.setValue(new Date());
    this.fg.setControl('items', this.fb.array<FormGroup<IAppReceiptVoucherItemControls>>([]));
    this.currentReceiptVoucher.set(null);
    this.lastClickedTableRowIndex.set(null);
    this.setUpNewReceiptVoucherDetailsRowFg();
  }

  /** Reset the form and navigate to the Add route — same pattern as onNewJournal() */
  onNewReceiptVoucher() {
    this.onResetReceiptVoucher();
    this.router.navigate(['/accounts/collective-receipts/add']);
  }

  deleteReceiptVoucher(event: Event) {
    const receipt = this.currentReceiptVoucher();
    if (!receipt) return;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل أنت متأكد من حذف السند؟',
      header: 'حذف السند',
      icon: 'pi pi-info-circle',
      rejectButtonProps: { label: 'إلغاء', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'حذف', severity: 'danger' },
      accept: () => {
        this.receiptVoucherService.delete(receipt.id).subscribe({
          next: () => {
            this.router.navigate(['/accounts/collective-receipts/add']);
          },
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'إلغاء', detail: 'تم إلغاء الحذف' });
      },
    });
  }

  // ── Bank / Cash accounts ──────────────────────────────────────────

  bankCashAccounts = signal<ISelectableBankCashAccount[]>([]);

  getCashAndBankAccountsAndCustodyAccounts() {
    this.financialAccountService.getCashAndBankAccountsAndCustodyAccounts().subscribe({
      next: (res) => {
        this.bankCashAccounts.set([...res.cash, ...res.bank, ...res.custody]);
      },
    });
  }

  // ── Financial accounts search ─────────────────────────────────────

  _financialAccounts = signal<ITreeFinancialAccountSearchRow[]>([]);
  financialAccounts = computed(() =>
    this._financialAccounts()
      .filter((a) => a.stage >= 3)
      .map((a) => ({ ...a, label: `${a.name} - ${a.finNumber}` })),
  );
  financialAccountService = inject(FinancialAccountService);
  financialAccountsPaginationInfo: IPaginationInfo = {
    pageIndex: 0,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

  debouncedReceiptVoucherSearch(id: string) {
    if (!id) return;

    this.receiptVoucherService.getById(+id).subscribe({
      next: (data) => {
        this.currentReceiptVoucher.set(data);
        this.fg.patchValue({
          id: data.id,
          voucherNo: data.voucherNo,
          voucherDate: new Date(data.voucherDate),
          debitAccountId: data.debitAccountId,
          isHasTax: data.isHasTax,
          notes: data.notes,
        });
        this.fg.setControl(
          'items',
          this.fb.array<FormGroup<IAppReceiptVoucherItemControls>>(
            data.lines.map((item) =>
              this.createNewReceiptVoucherDetailsItemFg({
                finincalAccountId: item.finincalAccountId,
                isHasTax: item.isHasTax,
                totalAmount: item.totalAmount,
                notes: null,
              }),
            ),
          ),
        );
      },
    });
  }

  searchFinancialAccounts(
    pageIndex: number,
    searchValue: string = '',
    searchEnum: FinancialAccountSearchEnum = FinancialAccountSearchEnum.Name,
  ) {
    this.financialAccountService
      .search({
        paginationInfo: { pageIndex, pageSize: 0 },
        searchFilters: [{ column: searchEnum, values: [searchValue] }],
        fromDate: null,
      })
      .subscribe({
        next: (res) => {
          this._financialAccounts.set(res.value.rows);
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

  debouncedFinancialAccountsSearch(
    event: IDebounceEvent,
    searchValue: string,
    searchEnum: FinancialAccountSearchEnum = FinancialAccountSearchEnum.Name,
  ) {
    if (event.type === 'scrollToEnd') {
      if (this.financialAccountsPaginationInfo.pageIndex < this.financialAccountsPaginationInfo.totalPagesCount) {
        this.searchFinancialAccounts(this.financialAccountsPaginationInfo.pageIndex + 1, searchValue, searchEnum);
      }
    } else {
      this.searchFinancialAccounts(1, searchValue, searchEnum);
    }
  }

  onSubmit = () => this.fg.valid && this.searchFinancialAccounts(1);
  onPageChange = (event: PaginatorState) => this.searchFinancialAccounts(event.page! + 1);

  // ── Row state ─────────────────────────────────────────────────────

  lastClickedTableRowIndex = signal<number | null>(null);

  deleteReceiptVoucherDetailRow(rowIndex: number) {
    this.fg.controls.items.removeAt(rowIndex);
  }

  // ── Amount normalization (strip leading zeros, cap 2 decimal places) ──

  normalizeAmount(control: AbstractControl) {
    const num = parseFloat(String(control.value ?? 0));
    if (isNaN(num) || num < 0) {
      control.setValue(0, { emitEvent: false });
      return;
    }
    control.setValue(parseFloat(num.toFixed(2)), { emitEvent: false });
  }

  // ── New-row form group ────────────────────────────────────────────

  newReceiptVoucherDetailsItemFg!: FormGroup<IAppReceiptVoucherItemControls>;

  createNewReceiptVoucherDetailsItemFg(data?: IAppReceiptVoucherItem) {
    return this.fb.group<IAppReceiptVoucherItemControls>({
      finincalAccountId: this.fb.control<number | null>(data?.finincalAccountId ?? null, [Validators.required]),
      isHasTax: this.fb.control<boolean>(data?.isHasTax ?? false, []),
      totalAmount: this.fb.control<number>(data?.totalAmount ?? 0, [
        Validators.required,
        Validators.min(0),
        onlyNumbersOrDotAllowed,
      ]),
      notes: this.fb.control<string | null>(data?.notes ?? null, [Validators.maxLength(1000)]),
    });
  }

  setUpNewReceiptVoucherDetailsRowFg() {
    if (this.newReceiptVoucherDetailsItemFg) {
      this.newReceiptVoucherDetailsItemFg.reset();
      this.newReceiptVoucherDetailsItemFg.patchValue({ isHasTax: false, totalAmount: 0 });
    } else {
      this.newReceiptVoucherDetailsItemFg = this.createNewReceiptVoucherDetailsItemFg();
    }
  }

  submitNewReceiptVoucherDetailsItem() {
    // Normalize amounts before validation
    this.normalizeAmount(this.newReceiptVoucherDetailsItemFg.controls.totalAmount);

    if (this.newReceiptVoucherDetailsItemFg.invalid) {
      this.newReceiptVoucherDetailsItemFg.markAllAsTouched();
      return;
    }

    if ((this.newReceiptVoucherDetailsItemFg.value.totalAmount ?? 0) <= 0) {
      this.newReceiptVoucherDetailsItemFg.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'يجب إدخال مبلغ أكبر من صفر' });
      return;
    }

    this.fg.controls.items.push(
      this.createNewReceiptVoucherDetailsItemFg(this.newReceiptVoucherDetailsItemFg.getRawValue()),
    );

    this.lastClickedTableRowIndex.set(this.fg.controls.items.length - 1);
    this.setUpNewReceiptVoucherDetailsRowFg();
  }

  onReceiptVoucherDetailsItemAccountChange(fg: FormGroup<IAppReceiptVoucherItemControls>, itemId: number) {
    fg.controls.finincalAccountId.setValue(itemId);
  }


  // ── Print ─────────────────────────────────────────────────────────

  printReceiptVoucher() {
    const receipt = this.currentReceiptVoucher();
    if (!receipt) return;

    const fmt = (dateStr: string) => {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };
    const money = (v: number) => v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    const lineRows = receipt.lines.map((line, i) => `
      <tr>
        <td class="num">${i + 1}</td>
        <td>${line.finincalAccountName ?? '-'}</td>
        <td class="num">${line.isHasTax ? '✓' : '-'}</td>
        <td class="num">${money(line.totalAmount)}</td>
      </tr>`).join('');

    const html = `
      <!-- ── Header ── -->
      <div class="doc-header">
        <div class="doc-logo">🏛️</div>
        <div class="doc-company">
          <div class="doc-company-name">Rest House</div>
          <div class="doc-company-sub">نظام إدارة المطاعم والحسابات</div>
        </div>
        <div class="doc-title-box">سند قبض مجمع</div>
      </div>

      <!-- ── Meta fields ── -->
      <div class="meta-grid cols-3">
        <div class="meta-field">
          <span class="meta-label">رقم السند:</span>
          <span class="meta-value">${receipt.id}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">الرقم الدفتري:</span>
          <span class="meta-value">${receipt.voucherNo ?? '-'}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">التاريخ:</span>
          <span class="meta-value">${fmt(receipt.voucherDate)}</span>
        </div>
        <div class="meta-field" style="grid-column: 1 / -1">
          <span class="meta-label">البنك / الصندوق:</span>
          <span class="meta-value">${receipt.debitAccountName ?? '-'}</span>
        </div>
      </div>

      <!-- ── Main statement ── -->
      <div class="statement-banner mb-2">
        <span>تم استلام مبلغ وقدره: </span>
        <span class="amount-words">${money(receipt.totalAmount)} ريال</span>
        ${receipt.notes ? `<span> — ${receipt.notes}</span>` : ''}
      </div>

      <!-- ── Lines table ── -->
      <table class="lines-table">
        <thead>
          <tr>
            <th style="width:5%">#</th>
            <th style="width:45%">الحساب</th>
            <th style="width:15%">ضريبة</th>
            <th style="width:35%">المبلغ</th>
          </tr>
        </thead>
        <tbody>${lineRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="bold">إجمالي السند</td>
            <td class="num bold">${money(receipt.totalAmount)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- ── Signature footer ── -->
      <div class="sig-footer">
        <div class="sig-row">
          <div class="sig-box">
            <span class="sig-title">المستلم</span>
            <div class="sig-line"></div>
            <span class="sig-name">التوقيع / الاسم</span>
          </div>
          <div class="sig-box">
            <span class="sig-title">المحاسب</span>
            <div class="sig-line"></div>
            <span class="sig-name">التوقيع / الاسم</span>
          </div>
          <div class="sig-box">
            <span class="sig-title">مدير الحسابات</span>
            <div class="sig-line"></div>
            <span class="sig-name">التوقيع / الاسم</span>
          </div>
          <div class="sig-box">
            <span class="sig-title">الختم</span>
            <div class="sig-line"></div>
            <span class="sig-name">ختم الشركة</span>
          </div>
        </div>
      </div>`;

    this.a4PrintService.print(html);
  }
}
