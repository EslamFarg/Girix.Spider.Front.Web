import { BaseComponent, FormMode, IPaginationInfo } from '@/components';
import { AllowNumbers } from '@/directives/allow-numbers';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { InputErrorMessageHandler, onlyNumbersOrDotAllowed } from '@/yn-ng';
import { ControlsOf } from '@/yn-ng/types/helpers';
import { Component, computed, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectComponent, NgItemLabelDirective, NgLabelTemplateDirective } from '@ng-select/ng-select';
import { ButtonDirective } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorState } from 'primeng/paginator';
import { Textarea } from 'primeng/textarea';
import { FinancialAccountSearchEnum, FinancialAccountService } from '../../services/financial-account-service';
import { PaymentVoucherService } from '../../services/payment-voucher-service';
import {
  IBankFinancialAccount,
  ICashFinancialAccount,
  ICustodyFinancialAccount,
  IFinancialAccountSearchResponseValue,
  IFinancialAccountSearchRow,
  IPaymentVoucherReadResponse,
  ITreeFinancialAccountSearchRow,
} from '../../types';

interface IAppPaymentVoucherItem {
  finincalAccountId: number | null;
  isHasTax: boolean;
  totalAmount: number;
}
type IAppPaymentVoucherItemControls = ControlsOf<IAppPaymentVoucherItem>;

type ISelectableBankCashAccount = ICashFinancialAccount | IBankFinancialAccount | ICustodyFinancialAccount;

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

  constructor() {
    super();
    this.searchFinancialAccounts(0);
    this.getCashAndBankAccountsAndCustodyAccounts();
    this.setUpNewPaymentVoucherDetailsRowFg();
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
    const totalAmount = voucherItems.reduce((sum, item) => sum + (item.totalAmount ?? 0), 0);

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
            this.onResetPaymentVoucher();
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
            next: () => {},
          });
        break;
    }
  }

  onResetPaymentVoucher() {
    this.fg.reset();
    this.fg.setControl('items', this.fb.array<FormGroup<IAppPaymentVoucherItemControls>>([]));
    this.currentPaymentVoucher.set(null);
    this.currentEditRowIndex.set(-1);
    this.lastClickedTableRowIndex.set(null);
    this.setUpNewPaymentVoucherDetailsRowFg();
  }

  bankCashAccounts = signal<ISelectableBankCashAccount[]>([]);

  getCashAndBankAccountsAndCustodyAccounts() {
    this.financialAccountService.getCashAndBankAccountsAndCustodyAccounts().subscribe({
      next: (res) => {
        this.bankCashAccounts.set([...res.cash, ...res.bank, ...res.custody]);
      },
    });
  }

  _financialAccounts = signal<ITreeFinancialAccountSearchRow[]>([]);
  financialAccounts = computed(() => this._financialAccounts().filter(a=>a.stage>=3).map(a=>({
    ...a,label:`${a.name} - ${a.finNumber}`,
  })));
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
        paginationInfo: {
          pageIndex,
          pageSize: 0,
        },
        searchFilters: [
          {
            column: FinancialAccountSearchEnum.Name,
            values: [searchValue],
          },
          {
            column: FinancialAccountSearchEnum.FinNumber,
            values: [searchValue],
          },
          {
            column: FinancialAccountSearchEnum.Id,
            values: [searchValue],
          },
        ],
        fromDate: null,
      })
      .subscribe({
        next: (res) => {
          // if (pageIndex === 1) {
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
    if (event.type === 'scrollToEnd') {
      if (this.financialAccountsPaginationInfo.pageIndex < this.financialAccountsPaginationInfo.totalPagesCount) {
        this.searchFinancialAccounts(this.financialAccountsPaginationInfo.pageIndex + 1, searchValue);
      }
    } else {
      this.searchFinancialAccounts(1, searchValue);
    }
  }

  onSubmit = () => this.fg.valid && this.searchFinancialAccounts(1);

  onPageChange = (event: PaginatorState) => this.searchFinancialAccounts(event.page! + 1);

  lastClickedTableRowIndex = signal<number | null>(null);
  currentEditRowIndex = signal<number>(-1);

  editPaymentVoucherDetailRow(rowIndex: number) {
    this.lastClickedTableRowIndex.set(rowIndex + 1);
    this.currentEditRowIndex.set(rowIndex);
  }

  isRowEditable(rowIndex: number) {
    return this.currentEditRowIndex() === rowIndex;
  }

  deletePaymentVoucherDetailRow(rowIndex: number) {
    this.fg.controls.items.removeAt(rowIndex);
    this.currentEditRowIndex.set(-1);
  }

  newPaymentVoucherDetailsItemFg!: FormGroup<IAppPaymentVoucherItemControls>;

  createNewPaymentVoucherDetailsItemFg(data?: IAppPaymentVoucherItem) {
    return this.fb.group<IAppPaymentVoucherItemControls>({
      finincalAccountId: this.fb.control<number | null>(data?.finincalAccountId ?? null, [Validators.required]),
      isHasTax: this.fb.control<boolean>(data?.isHasTax ?? false, []),
      totalAmount: this.fb.control<number>(data?.totalAmount ?? 0, [Validators.required, Validators.min(0),onlyNumbersOrDotAllowed]),
    });
  }

  setUpNewPaymentVoucherDetailsRowFg() {
    if (this.newPaymentVoucherDetailsItemFg) {
      this.newPaymentVoucherDetailsItemFg.reset();
      this.newPaymentVoucherDetailsItemFg.patchValue({
        isHasTax: false,
        totalAmount: 0,
      });
    } else {
      this.newPaymentVoucherDetailsItemFg = this.createNewPaymentVoucherDetailsItemFg();
    }
  }

  submitNewPaymentVoucherDetailsItem() {
    if (this.newPaymentVoucherDetailsItemFg.invalid) {
      this.newPaymentVoucherDetailsItemFg.markAllAsTouched();
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
}
