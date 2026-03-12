import { Component, computed, effect, inject, signal } from '@angular/core';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Button, ButtonDirective } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { CollectionsService } from '../../services/collections-service';
import { PrintableOrderInvoice } from '@/features/orders/components/printable-order-invoice/printable-order-invoice';
import { OrderService } from '@/features/orders';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseComponent, IPaginationInfo } from '@/components';
import { ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { AllowNumbers } from '@/directives/allow-numbers';
import { NumbersKeyboard } from '@/features/keyboard/components/numbers-keyboard/numbers-keyboard';
import { KeyboardService } from '@/features/keyboard/services/keyboard-service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { IDebounceEvent, Debounce } from '@/directives/debounce';
import {
  FinancialAccountSearchEnum,
  FinancialAccountService,
} from '@/features/accounts/services/financial-account-service';
import { ITreeFinancialAccountSearchRow } from '@/features/accounts/services/financial-account-types';
import { noSymbolsAllowed } from '@/yn-ng';

@Component({
  selector: 'app-collection-dialog',
  imports: [
    InputErrorMessageHandler,
    Button,
    Select,
    InputText,
    Dialog,
    PrintableOrderInvoice,
    TranslatePipe,
    ReactiveFormsModule,
    AllowNumbers,
    NumbersKeyboard,
    NgSelectComponent,
    Debounce,
    ButtonDirective
],
  templateUrl: './collection-dialog.html',
  styleUrl: './collection-dialog.css',
})
export class CollectionDialog extends BaseComponent {
  collectionsService = inject(CollectionsService);
  collect = this.collectionsService.collect;
  orderService = inject(OrderService);
  currentBill = this.collectionsService.currentBill;
  isCollectionInvoiceDialogVisible = this.collectionsService.isCollectionInvoiceDialogVisible;
  net = computed(() => this.currentBill()?.summary.totalNet ?? 0);

  /**
   *
   */
  constructor() {
    super();
    this.searchAccounts({
      pageIndex: 1,
      searchTerm: '',
    }).subscribe({
      next: (res) => {
        this.cashAccounts.set(res.value.rows);
        this.networkAccounts.set(res.value.rows);
      },
    });
  }

  closeCollectionInvoiceDialog() {
    this.collectionsService.closeCollectionInvoiceDialog();
  }

  initialPaymentFgValue = {
    orderId: this.fb.control<number | null>(0, [Validators.required]),
    cashPaymentAmount: this.fb.control<number>(0, []),
    networkPaymentAmount: this.fb.control<number>(0, []),
    cashAccountId: this.fb.control<number | null>(null, [Validators.required]),
    networkAccountId: this.fb.control<number | null>(null, [Validators.required]),
    collectionDate: this.fb.control<string | null>(null, [Validators.required]),
  };
  paymentFg = this.fb.group(this.initialPaymentFgValue);
  //
  //
  //
  //
  //
  //
  //
  //
  //

  onSubmitCollection() {
    if (this.paymentFg.invalid) {
      console.log('invalid paymentFg');
      this.paymentFg.markAllAsTouched();
      return;
    }
    this.collect(this.paymentFg.value as any).subscribe({
      next: (value) => {
        this.closeCollectionInvoiceDialog();
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
  //Accounts
  //

  currentCashAccount = signal<{
    id: number;
    name: string;
  } | null>(null);
  currentNetworkAccount = signal<{
    id: number;
    name: string;
  } | null>(null);

  cashAccountSearchFg = this.fb.group({
    searchTerm: this.fb.control('', [Validators.maxLength(100), noSymbolsAllowed, Validators.minLength(1)]),
  });
  networkAccountSearchFg = this.fb.group({
    searchTerm: this.fb.control('', [Validators.maxLength(100), noSymbolsAllowed, Validators.minLength(1)]),
  });

  financialAccountService = inject(FinancialAccountService);

  cashAccounts = signal<ITreeFinancialAccountSearchRow[]>([]);
  networkAccounts = signal<ITreeFinancialAccountSearchRow[]>([]);

  displayedCashAccounts = computed(() => [this.currentCashAccount(), ...this.cashAccounts()]);
  displayedNetworkAccounts = computed(() => [this.currentNetworkAccount(), ...this.networkAccounts()]);

  searchAccounts(data: { pageIndex: number; searchTerm?: string }) {
    return this.financialAccountService.search({
      paginationInfo: {
        pageIndex: data.pageIndex,
        pageSize: 10,
      },
      searchFilters: [
        {
          column: FinancialAccountSearchEnum.Name,
          values: [data.searchTerm ?? ''],
        },
      ],
      fromDate: null,
    });
  }
  cashAccountsSearchPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalRowsCount: 0,
    totalPagesCount: 0,
  };
  networkAccountsSearchPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalRowsCount: 0,
    totalPagesCount: 0,
  };

  previousCashAccountsSearchTerm: string = '';
  previousNetworkAccountsSearchTerm: string = '';

  onCashFinancialAccountsSearch(
    event: IDebounceEvent<{
      term: string;
    }>,
  ) {
    let searchTerm = event?.value?.term ?? '';
    let isNewSearchTerm = searchTerm != this.previousCashAccountsSearchTerm;
    if (event.key === 'scrollToEnd') {
      searchTerm = this.previousCashAccountsSearchTerm;
    }
    if (searchTerm && searchTerm.length > 100) return;
    //
    //
    if (isNewSearchTerm) {
      //refetch page 1
      this.searchAccounts({ pageIndex: 1, searchTerm }).subscribe({
        next: (res) => {
          if (res.value.rows.length > 0) {
            this.previousCashAccountsSearchTerm = searchTerm;
            this.cashAccounts.set(res.value.rows);
            this.cashAccountsSearchPaginationInfo = {
              pageIndex: 1,
              totalPagesCount: res.value.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.paginationInfo.totalRowsCount,
            };
          }
        },
      });
    } else {
      //refetch next page
      this.searchAccounts({ pageIndex: this.cashAccountsSearchPaginationInfo.pageIndex + 1, searchTerm }).subscribe({
        next: (res) => {
          if (res.value.rows.length > 0) {
            this.previousCashAccountsSearchTerm = searchTerm;
            this.cashAccounts.update((prev) => prev.concat(res.value.rows));
            this.cashAccountsSearchPaginationInfo = {
              pageIndex: this.cashAccountsSearchPaginationInfo.pageIndex + 1,
              totalPagesCount: res.value.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.paginationInfo.totalRowsCount,
            };
          }
        },
      });
    }
  }

  onNetworkFinancialAccountsSearch(
    event: IDebounceEvent<{
      term: string;
    }>,
  ) {
    let searchTerm = event?.value?.term ?? '';
    let isNewSearchTerm = searchTerm != this.previousNetworkAccountsSearchTerm;
    if (event.key === 'scrollToEnd') {
      searchTerm = this.previousNetworkAccountsSearchTerm;
    }
    if (searchTerm && searchTerm.length > 100) return;
    //
    //
    if (isNewSearchTerm) {
      //refetch page 1
      this.searchAccounts({ pageIndex: 1, searchTerm }).subscribe({
        next: (res) => {
          if (res.value.rows.length > 0) {
            this.previousNetworkAccountsSearchTerm = searchTerm;
            this.networkAccounts.set(res.value.rows);
            this.networkAccountsSearchPaginationInfo = {
              pageIndex: 1,
              totalPagesCount: res.value.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.paginationInfo.totalRowsCount,
            };
          }
        },
      });
    } else {
      //refetch next page
      this.searchAccounts({
        pageIndex: this.networkAccountsSearchPaginationInfo.pageIndex + 1,
        searchTerm,
      }).subscribe({
        next: (res) => {
          if (res.value.rows.length > 0) {
            this.previousNetworkAccountsSearchTerm = searchTerm;
            this.networkAccounts.update((prev) => prev.concat(res.value.rows));
            this.networkAccountsSearchPaginationInfo = {
              pageIndex: this.networkAccountsSearchPaginationInfo.pageIndex + 1,
              totalPagesCount: res.value.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.paginationInfo.totalRowsCount,
            };
          }
        },
      });
    }
  }
  //
  //
  //
  //
  //
  //
  //
  keyboardService = inject(KeyboardService);
  triggerNumbersKeyboard(input: HTMLInputElement) {
    this.keyboardService.triggerNumbersKeyboard(input);
  }

  //
  //
  //
  //
  //
  //
  //payment info
  //

  paymentDialogVisible = false;

  showPaymentDialog() {
    this.paymentDialogVisible = true;
  }

  getPaymentInvalidControl() {
    const cashControl = this.paymentFg.get('cashPaymentAmount');
    const networkControl = this.paymentFg.get('networkPaymentAmount');
    if (cashControl?.invalid && cashControl?.touched) {
      return cashControl;
    } else if (networkControl?.invalid && networkControl?.touched) {
      return networkControl;
    }
    return null;
  }

  // isPaid = signal<boolean>(true);

  currentBillEffect = effect(() => {
    let validators: ValidatorFn[] = [];
    const cashControl = this.paymentFg.get('cashPaymentAmount');
    const networkControl = this.paymentFg.get('networkPaymentAmount');
    console.log(this.currentBill());
    if (this.currentBill()) {
      validators = [];
      this.paymentFg.patchValue({
        cashPaymentAmount: this.net(),
        networkPaymentAmount: 0,
        orderId: this.currentBill()!.id,
        collectionDate: this.dateNowIso,
      });
      cashControl?.enable();
      networkControl?.enable();
    } else {
      cashControl?.disable();
      networkControl?.disable();
    }
    cashControl?.setValidators(validators);
    networkControl?.setValidators(validators);
  });

  cashInputSubscription = this.paymentFg.get('cashPaymentAmount')?.valueChanges.subscribe((value) => {
    const net = this.net();
    let futureValue = value ?? 0;
    if (futureValue > net) {
      futureValue = net;
    } else if (futureValue < 0) {
      futureValue = 0;
    }
    this.paymentFg.patchValue(
      {
        networkPaymentAmount: net - futureValue,
        cashPaymentAmount: futureValue,
      },
      { emitEvent: false },
    );
  });

  networkInputSubscription = this.paymentFg.get('networkPaymentAmount')?.valueChanges.subscribe((value) => {
    const net = this.net();
    let futureValue = value ?? 0;
    if (futureValue > net) {
      futureValue = net;
    } else if (futureValue < 0) {
      futureValue = 0;
    }
    this.paymentFg.patchValue(
      {
        cashPaymentAmount: net - futureValue,
        networkPaymentAmount: futureValue,
      },
      { emitEvent: false },
    );
  });
}
