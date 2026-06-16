import { BaseComponent, FormMode, IPaginationInfo } from '@/components';
import { AllowNumbers } from '@/directives/allow-numbers';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { InputErrorMessageHandler, onlyNumbersOrDotAllowed } from '@/yn-ng';
import { ControlsOf } from '@/yn-ng/types/helpers';
import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectComponent, NgItemLabelDirective, NgLabelTemplateDirective } from '@ng-select/ng-select';
import { ButtonDirective } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorState } from 'primeng/paginator';
import { Textarea } from 'primeng/textarea';
import { A4PrintService } from '@/core';
import { FinancialAccountSearchEnum, FinancialAccountService } from '../../services/financial-account-service';
import { PaymentVoucherService } from '../../services/payment-voucher-service';
import {
  IFinancialAccountSearchRow,
  IPaymentVoucherReadResponse,
  ITreeFinancialAccountSearchRow,
} from '../../types';

interface IAppPaymentVoucherItem {
  finincalAccountId: number | null;
  isHasTax: boolean;
  totalAmount: number;
  notes: string | null;
}
type IAppPaymentVoucherItemControls = ControlsOf<IAppPaymentVoucherItem>;

type ISelectableBankCashAccount = Omit<IFinancialAccountSearchRow, 'stage'>;

@Component({
  selector: 'app-collective-payment-form',
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
    NgItemLabelDirective,
    NgLabelTemplateDirective,
  ],
  templateUrl: './collective-payment-form.html',
  styleUrl: './collective-payment-form.css',
})
export class CollectivePaymentForm extends BaseComponent {
  id = input.required<number>();
  FinancialAccountSearchEnum = FinancialAccountSearchEnum;

  currentPaymentVoucher = signal<IPaymentVoucherReadResponse | null>(null);
  paymentVoucherService = inject(PaymentVoucherService);
  a4PrintService = inject(A4PrintService);
  formMode = computed(() => {
    if (this.currentPaymentVoucher()) return FormMode.Update;
    return this.initialFormMode();
  });

  initialFormValue = {
    id: this.fb.control<number | null>({ value: null, disabled: true }, []),
    voucherNo: this.fb.control<string | null>(null, [Validators.required]),
    voucherDate: this.fb.control<Date | null>(new Date(), [Validators.required]),
    payee: this.fb.control<string | null>(null, [Validators.required, Validators.maxLength(300)]),
    creditAccountId: this.fb.control<number | null>(null, [Validators.required]),
    isHasTax: this.fb.control<boolean>(false, []),
    notes: this.fb.control<string | null>(null, [Validators.required, Validators.minLength(2), Validators.maxLength(1000)]),
    items: this.fb.array<FormGroup<IAppPaymentVoucherItemControls>>([], [Validators.required, Validators.minLength(1)]),
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
    this.setUpNewPaymentVoucherDetailsRowFg();

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
        this.paymentVoucherService.getById(this.id()).subscribe({
          next: (data) => {
            this.debouncedPaymentVoucherSearch(data.id.toString());
          },
        });
        break;
    }
  }

  onSubmitPaymentVoucher() {
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
      creditAccountId: this.fg.value.creditAccountId!,
      isHasTax: this.fg.value.isHasTax ?? false,
      totalAmount: +totalAmount,
      payee: this.fg.value.payee!,
      paymentVoucherDetailsRequestDtos: voucherItems.map((item) => ({
        finincalAccountId: item.finincalAccountId!,
        isHasTax: item.isHasTax ?? false,
        totalAmount: +(item.totalAmount ?? 0),
      })),
    };

    switch (this.formMode()) {
      case FormMode.Create:
        this.paymentVoucherService.create(data).subscribe({
          next: () => {
            this.onNewPaymentVoucher();
          },
        });
        break;
      case FormMode.Update:
        this.paymentVoucherService
          .put({
            id: this.currentPaymentVoucher()!.id,
            ...data,
          })
          .subscribe({
            next: () => {
              this.onNewPaymentVoucher();
            },
          });
        break;
    }
  }

  onResetPaymentVoucher() {
    this.fg.reset();
    this.fg.controls.voucherDate.setValue(new Date());
    this.fg.setControl('items', this.fb.array<FormGroup<IAppPaymentVoucherItemControls>>([]));
    this.currentPaymentVoucher.set(null);
    this.lastClickedTableRowIndex.set(null);
    this.setUpNewPaymentVoucherDetailsRowFg();
  }

  /** Reset form and navigate to Add route — same pattern as onNewReceiptVoucher() */
  onNewPaymentVoucher() {
    this.onResetPaymentVoucher();
    this.router.navigate(['/accounts/collective-payments/add']);
  }

  deletePaymentVoucher(event: Event) {
    const voucher = this.currentPaymentVoucher();
    if (!voucher) return;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل أنت متأكد من حذف السند؟',
      header: 'حذف السند',
      icon: 'pi pi-info-circle',
      rejectButtonProps: { label: 'إلغاء', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'حذف', severity: 'danger' },
      accept: () => {
        this.paymentVoucherService.delete(voucher.id).subscribe({
          next: () => {
            this.router.navigate(['/accounts/collective-payments/add']);
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

  debouncedPaymentVoucherSearch(id: string) {
    if (!id) return;

    this.paymentVoucherService.getById(+id).subscribe({
      next: (data) => {
        this.currentPaymentVoucher.set(data);
        this.fg.patchValue({
          id: data.id,
          voucherNo: data.voucherNo,
          voucherDate: new Date(data.voucherDate),
          payee: data.payee,
          creditAccountId: data.creditAccountId,
          isHasTax: data.isHasTax,
          notes: data.notes,
        });
        this.fg.setControl(
          'items',
          this.fb.array<FormGroup<IAppPaymentVoucherItemControls>>(
            data.lines.map((item) =>
              this.createNewPaymentVoucherDetailsItemFg({
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

  deletePaymentVoucherDetailRow(rowIndex: number) {
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

  newPaymentVoucherDetailsItemFg!: FormGroup<IAppPaymentVoucherItemControls>;

  createNewPaymentVoucherDetailsItemFg(data?: IAppPaymentVoucherItem) {
    return this.fb.group<IAppPaymentVoucherItemControls>({
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

  setUpNewPaymentVoucherDetailsRowFg() {
    if (this.newPaymentVoucherDetailsItemFg) {
      this.newPaymentVoucherDetailsItemFg.reset();
      this.newPaymentVoucherDetailsItemFg.patchValue({ isHasTax: false, totalAmount: 0 });
    } else {
      this.newPaymentVoucherDetailsItemFg = this.createNewPaymentVoucherDetailsItemFg();
    }
  }

  submitNewPaymentVoucherDetailsItem() {
    this.normalizeAmount(this.newPaymentVoucherDetailsItemFg.controls.totalAmount);

    if (this.newPaymentVoucherDetailsItemFg.invalid) {
      this.newPaymentVoucherDetailsItemFg.markAllAsTouched();
      return;
    }

    if ((this.newPaymentVoucherDetailsItemFg.value.totalAmount ?? 0) <= 0) {
      this.newPaymentVoucherDetailsItemFg.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'يجب إدخال مبلغ أكبر من صفر' });
      return;
    }

    this.fg.controls.items.push(
      this.createNewPaymentVoucherDetailsItemFg(this.newPaymentVoucherDetailsItemFg.getRawValue()),
    );

    this.lastClickedTableRowIndex.set(this.fg.controls.items.length - 1);
    this.setUpNewPaymentVoucherDetailsRowFg();
  }

  onPaymentVoucherDetailsItemAccountChange(fg: FormGroup<IAppPaymentVoucherItemControls>, itemId: number) {
    fg.controls.finincalAccountId.setValue(itemId);
  }

  // ── Print ─────────────────────────────────────────────────────────

  printPaymentVoucher() {
    const voucher = this.currentPaymentVoucher();
    if (!voucher) return;

    const fmt = (dateStr: string) => {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };
    const money = (v: number) => v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    const lineRows = voucher.lines.map((line, i) => `
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
        <div class="doc-title-box">سند صرف مجمع</div>
      </div>

      <!-- ── Meta fields ── -->
      <div class="meta-grid cols-3">
        <div class="meta-field">
          <span class="meta-label">رقم السند:</span>
          <span class="meta-value">${voucher.id}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">الرقم الدفتري:</span>
          <span class="meta-value">${voucher.voucherNo ?? '-'}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">التاريخ:</span>
          <span class="meta-value">${fmt(voucher.voucherDate)}</span>
        </div>
        <div class="meta-field" style="grid-column: 1 / -1">
          <span class="meta-label">البنك / الصندوق:</span>
          <span class="meta-value">${voucher.creditAccountName ?? '-'}</span>
        </div>
        <div class="meta-field" style="grid-column: 1 / -1">
          <span class="meta-label">المستلم:</span>
          <span class="meta-value">${voucher.payee ?? '-'}</span>
        </div>
      </div>

      <!-- ── Main statement ── -->
      <div class="statement-banner mb-2">
        <span>تم صرف مبلغ وقدره: </span>
        <span class="amount-words">${money(voucher.totalAmount)} ريال</span>
        ${voucher.notes ? `<span> — ${voucher.notes}</span>` : ''}
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
            <td class="num bold">${money(voucher.totalAmount)}</td>
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
