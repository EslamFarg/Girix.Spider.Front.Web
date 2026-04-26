import { Component, computed, effect, inject, signal } from '@angular/core';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Button, ButtonDirective } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { CollectionsService } from '../../services/collections-service';
import { PrintableOrderInvoice } from '@/features/orders/components/printable-order-invoice/printable-order-invoice';
import { OrderLocationType, OrderService } from '@/features/orders';
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
import { ITreeFinancialAccountSearchRow } from '@/features/accounts/types';
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
    ButtonDirective,
  ],
  templateUrl: './collection-dialog.html',
  styleUrl: './collection-dialog.css',
})
export class CollectionDialog extends BaseComponent {
  OrderLocationType = OrderLocationType;
  collectionsService = inject(CollectionsService);
  collectNonDelivery = this.collectionsService.collectNonDelivery;
  collectPersonDelivery = this.collectionsService.collectPersonDelivery;
  collectCompanyDelivery = this.collectionsService.collectCompanyDelivery;
  orderService = inject(OrderService);
  currentBill = this.collectionsService.currentBill;
  isCollectionInvoiceDialogVisible = this.collectionsService.isCollectionInvoiceDialogVisible;

  net = computed(() => {
    // console.log('net change:');
    if (this.isDeliveryDialog()) {
      // console.log(`current delivery orders: ${JSON.stringify(this.currentDeliveryOrders())}`);
      return +this.currentDeliveryOrders()
        .reduce((acc, item) => {
          if (this.checkedOrderIds().includes(item.orderId)) {
            // console.log(`item: ${item.netOrder}`);
            return acc + item.netOrder;
          } else {
            return acc;
          }
        }, 0)
        .toFixed(2);
    } else {
      return +(this.currentBill()?.summary.totalNet ?? 0).toFixed(2);
    }
  });
  isDeliveryDialog = this.collectionsService.isDeliveryDialog;
  currentDeliveryOrders = this.collectionsService.currentDeliveryOrders;
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
    cashPaymentAmount: this.fb.control<number>(0, []),
    networkPaymentAmount: this.fb.control<number>(0, []),
    cashAccountId: this.fb.control<number | null>(null, [Validators.required]),
    networkAccountId: this.fb.control<number | null>(null, [Validators.required]),
    collectionDate: this.fb.control(this.localDateIso, [Validators.required]),
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
  currentDeliveryType = this.collectionsService.currentOrderType;
  currentDeliveryId = this.collectionsService.currentDeliveryId;

  onSubmitCollection() {
    if (this.paymentFg.invalid) {
      // console.log('invalid paymentFg');
      this.paymentFg.markAllAsTouched();
      return;
    }

    if (this.isDeliveryDialog() && this.checkedOrderIds().length === 0) {
      this.paymentFg.markAllAsTouched();
      return;
    }

    const cashPaymentAmount = (+(this.paymentFg.get('cashPaymentAmount')?.value ?? 0)).toFixed(2);
    const networkPaymentAmount = (+(this.paymentFg.get('networkPaymentAmount')?.value ?? 0)).toFixed(2);
    let formValue: any = { ...this.paymentFg.value, cashPaymentAmount, networkPaymentAmount };
    //        orderId: ,

    switch (this.currentDeliveryType()) {
      case OrderLocationType.PersonDelivery:
        formValue = { ...formValue, deliveryId: this.currentDeliveryId(), orderIds: this.checkedOrderIds() };
        this.collectPersonDelivery(formValue).subscribe({
          next: (value) => {
            this.closeCollectionInvoiceDialog();
            this.collectionsService.lastCollectedId.set(value.id);
          },
        });
        break;
      case OrderLocationType.CompanyDelivery:
        formValue = { ...formValue, companyId: this.currentDeliveryId(), orderIds: this.checkedOrderIds() };
        this.collectCompanyDelivery(formValue).subscribe({
          next: (value) => {
            this.closeCollectionInvoiceDialog();
            this.collectionsService.lastCollectedId.set(value.id);
          },
        });
        break;
      case null:
      default:
        formValue = { ...formValue, orderId: this.currentBill()!.id };
        this.collectNonDelivery(formValue).subscribe({
          next: (value) => {
            this.closeCollectionInvoiceDialog();
            this.collectionsService.lastCollectedId.set(value.id);
          },
        });
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
    if (event.type === 'scrollToEnd') {
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
    if (event.type === 'scrollToEnd') {
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
    // console.log(this.currentBill());
    if (this.currentBill() || this.checkedOrderIds().length > 0) {
      validators = [];
      this.paymentFg.patchValue({
        cashPaymentAmount: this.net(),
        networkPaymentAmount: 0,
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
  checkedOrderIds = signal<number[]>([]);
  checkOrder(event: Event, orderId: number) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.checkedOrderIds.update((prev) => [...prev, orderId]);
    } else {
      this.checkedOrderIds.update((prev) => prev.filter((id) => id !== orderId));
    }
    // console.log(this.checkedOrderIds());
  }
}
