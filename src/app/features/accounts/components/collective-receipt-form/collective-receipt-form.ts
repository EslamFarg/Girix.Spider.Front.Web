import { BaseComponent, FormMode, IPaginationInfo } from '@/components';
import { AllowNumbers } from '@/directives/allow-numbers';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { InputErrorMessageHandler } from '@/yn-ng';
import { ControlsOf } from '@/yn-ng/types/helpers';
import { Component, computed, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ButtonDirective } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorState } from 'primeng/paginator';
import { Textarea } from 'primeng/textarea';
import { FinancialAccountSearchEnum, FinancialAccountService } from '../../services/financial-account-service';
import { ReceiptVoucherService } from '../../services/receipt-voucher-service';
import {
  IBankFinancialAccount,
  ICashFinancialAccount,
  ICustodyFinancialAccount,
  IReceiptVoucherReadResponse,
  ITreeFinancialAccountSearchRow,
} from '../../types';

interface IAppReceiptVoucherItem {
  finincalAccountId: number | null;
  isHasTax: boolean;
  totalAmount: number;
}
type IAppReceiptVoucherItemControls = ControlsOf<IAppReceiptVoucherItem>;

type ISelectableBankCashAccount = ICashFinancialAccount | IBankFinancialAccount | ICustodyFinancialAccount;

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
  ],
  templateUrl: './collective-receipt-form.html',
  styleUrl: './collective-receipt-form.css',
})
export class CollectiveReceiptForm extends BaseComponent {
  id = input.required<number>();
  FinancialAccountSearchEnum = FinancialAccountSearchEnum;
  currentReceiptVoucher = signal<IReceiptVoucherReadResponse | null>(null);
  receiptVoucherService = inject(ReceiptVoucherService);
  formMode = computed(() => {
    if (this.currentReceiptVoucher()) return FormMode.Update;
    return this.initialFormMode();
  });

  initialFormValue = {
    id: this.fb.control<number | null>({ value: null, disabled: true }, []),
    voucherNo: this.fb.control<string | null>(null, [Validators.required]),
    voucherDate: this.fb.control<Date | null>(null, [Validators.required]),
    debitAccountId: this.fb.control<number | null>(null, [Validators.required]),
    isHasTax: this.fb.control<boolean>(false, []),
    notes: this.fb.control<string | null>(null, [Validators.required, Validators.maxLength(1000)]),
    items: this.fb.array<FormGroup<IAppReceiptVoucherItemControls>>([], [Validators.required, Validators.minLength(1)]),
  };
  fg = this.fb.group(this.initialFormValue);

  constructor() {
    super();
    this.searchFinancialAccounts(1);
    this.getCashAndBankAccountsAndCustodyAccounts();
    this.setUpNewReceiptVoucherDetailsRowFg();
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
      debitAccountId: this.fg.value.debitAccountId!,
      isHasTax: this.fg.value.isHasTax ?? false,
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
            this.onResetReceiptVoucher();
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
              this.onResetReceiptVoucher();
            },
          });
        break;
    }
  }

  onResetReceiptVoucher() {
    this.fg.reset();
    this.fg.setControl('items', this.fb.array<FormGroup<IAppReceiptVoucherItemControls>>([]));
    this.currentReceiptVoucher.set(null);
    this.currentEditRowIndex.set(-1);
    this.lastClickedTableRowIndex.set(null);
    this.setUpNewReceiptVoucherDetailsRowFg();
  }

  bankCashAccounts = signal<ISelectableBankCashAccount[]>([]);

  getCashAndBankAccountsAndCustodyAccounts() {
    this.financialAccountService.getCashAndBankAccountsAndCustodyAccounts().subscribe({
      next: (res) => {
        this.bankCashAccounts.set([...res.cash, ...res.bank, ...res.custody]);
      },
    });
  }

  financialAccounts = signal<ITreeFinancialAccountSearchRow[]>([]);
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
          pageSize: 10,
        },
        searchFilters: [
          {
            column: searchEnum,
            values: [searchValue],
          },
        ],
        fromDate: null,
      })
      .subscribe({
        next: (res) => {
          if (pageIndex === 1) {
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

  lastClickedTableRowIndex = signal<number | null>(null);
  currentEditRowIndex = signal<number>(-1);

  editReceiptVoucherDetailRow(rowIndex: number) {
    this.lastClickedTableRowIndex.set(rowIndex + 1);
    this.currentEditRowIndex.set(rowIndex);
  }

  isRowEditable(rowIndex: number) {
    return this.currentEditRowIndex() === rowIndex;
  }

  deleteReceiptVoucherDetailRow(rowIndex: number) {
    this.fg.controls.items.removeAt(rowIndex);
    this.currentEditRowIndex.set(-1);
  }

  newReceiptVoucherDetailsItemFg!: FormGroup<IAppReceiptVoucherItemControls>;

  createNewReceiptVoucherDetailsItemFg(data?: IAppReceiptVoucherItem) {
    return this.fb.group<IAppReceiptVoucherItemControls>({
      finincalAccountId: this.fb.control<number | null>(data?.finincalAccountId ?? null, [Validators.required]),
      isHasTax: this.fb.control<boolean>(data?.isHasTax ?? false, []),
      totalAmount: this.fb.control<number>(data?.totalAmount ?? 0, [Validators.required, Validators.min(0.01)]),
    });
  }

  setUpNewReceiptVoucherDetailsRowFg() {
    if (this.newReceiptVoucherDetailsItemFg) {
      this.newReceiptVoucherDetailsItemFg.reset();
      this.newReceiptVoucherDetailsItemFg.patchValue({
        isHasTax: false,
        totalAmount: 0,
      });
    } else {
      this.newReceiptVoucherDetailsItemFg = this.createNewReceiptVoucherDetailsItemFg();
    }
  }

  submitNewReceiptVoucherDetailsItem() {
    if (this.newReceiptVoucherDetailsItemFg.invalid) {
      this.newReceiptVoucherDetailsItemFg.markAllAsTouched();
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
}
