import { Component, computed, effect, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Button, ButtonDirective } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { CollectionsService } from '../../services/collections-service';
import { PrintableOrderInvoice } from '@/features/orders/components/printable-order-invoice/printable-order-invoice';
import { OrderLocationType, OrderService } from '@/features/orders';
import { OrderPrintWorkflowService } from '@/features/orders/services/order-print-workflow.service';
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
import { noSymbolsAllowed, omitKeys } from '@/yn-ng';
import { SpaceTypeEnum } from '@/features/replacements/services/replacements-service';
import { OrderCollectionCalculationsService } from '../../services/order-collection-calculations-service';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { DecimalMask } from "@/directives/decimal-mask";

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
    LoadingDisabledDirective,
    InputGroupAddon,
    DecimalMask
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
  orderPrintWorkflow = inject(OrderPrintWorkflowService);
  ordersCollectionsCaluclationsService = inject(OrderCollectionCalculationsService);
  currentBill = this.collectionsService.currentBill;
  isCollectionInvoiceDialogVisible = this.collectionsService.isCollectionInvoiceDialogVisible;
  currentOrderType = this.collectionsService.currentOrderType;

  net = computed(() => {
    if (this.currentBill()) {
      return this.ordersCollectionsCaluclationsService.calculateBillNet(this.currentBill()!);
    }
    switch (this.currentOrderType()) {
      case OrderLocationType.PersonDelivery:
      case OrderLocationType.CompanyDelivery:
        console.log(this.currentDeliveryOrders());
        console.log(this.checkedOrderIds());
        let finalNet = +this.currentDeliveryOrders().reduce((acc, item) => {
          if (this.checkedOrderIds().includes(item.orderId)) {
            // console.log(`item: ${item.netOrder}`);
            return acc + item.netOrder;
          } else {
            return acc;
          }
        }, 0);
        return finalNet;
      default:
        return 0;
    }
  });
  isDeliveryDialog = this.collectionsService.isDeliveryDialog;
  currentDeliveryOrders = this.collectionsService.currentDeliveryOrders;
  /**
   *
   */
  userDetails = this.authService.userDetails;

  constructor() {
    super();
    this.orderPrintWorkflow.preloadPrinterSettings();
    this.searchAccounts({
      pageIndex: 1,
      searchTerm: '',
    }).subscribe({
      next: (res) => {
        this.cashAccounts.set(res.value.rows);
        this.networkAccounts.set(res.value.rows);

        const userDetails = this.userDetails();
        if (userDetails?.cashPaymentAccountId) {
          this.paymentFg.patchValue({
            cashAccountId: userDetails.cashPaymentAccountId,
          });
        }
        if (userDetails?.bankPaymentAccountId) {
          this.paymentFg.patchValue({
            networkAccountId: userDetails.bankPaymentAccountId,
          });
        }
      },
    });
  }

  closeCollectionInvoiceDialog() {
    this.checkedOrderIds.set([]);
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

  onSubmitCollection(withPrint = false) {
    if (this.paymentFg.invalid) {
      this.paymentFg.markAllAsTouched();
      return;
    }

    if (this.isDeliveryDialog() && this.checkedOrderIds().length === 0) {
      this.paymentFg.markAllAsTouched();
      return;
    }

    const orderIdsToPrint = this.resolveOrderIdsForPrint();
    const cashPaymentAmount = +(this.paymentFg.get('cashPaymentAmount')?.value ?? 0);
    const networkPaymentAmount = +(this.paymentFg.get('networkPaymentAmount')?.value ?? 0);
    let formValue: any = {
      ...this.paymentFg.value,
      cashPaymentAmount: +cashPaymentAmount.toFixed(2),
      networkPaymentAmount: +networkPaymentAmount.toFixed(2),
      collectionDate: this.localDateIso,
    };

    const onCollectionSuccess = (value: { id: number }, collectedOrderIds: number[]) => {
      this.closeCollectionInvoiceDialog();
      this.collectionsService.lastCollectedId.set(value.id);
      this.collectionsService.collectionCompleted$.next();
      this.collectionsService.collectedOrderIds.set(collectedOrderIds);
      this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم التحصيل بنجاح' });
      if (withPrint) {
        this.printCustomerInvoices(orderIdsToPrint);
      }
    };

    if (this.currentBill()) {
      const orderId = this.currentBill()!.id;
      formValue = { ...formValue, orderId };
      this.collectNonDelivery(formValue).subscribe({
        next: (value) => onCollectionSuccess(value, [orderId]),
      });
      return;
    }

    const checkedOrderIds = [...this.checkedOrderIds()];
    switch (this.currentDeliveryType()) {
      case OrderLocationType.PersonDelivery:
        formValue = { ...formValue, deliveryId: this.currentDeliveryId(), orderIds: checkedOrderIds };
        this.collectPersonDelivery(formValue).subscribe({
          next: (value) => {
            this.optimisticallyMarkOrdersAsCollected(checkedOrderIds);
            onCollectionSuccess(value, checkedOrderIds);
          },
        });
        break;
      case OrderLocationType.CompanyDelivery:
        formValue = { ...formValue, companyId: this.currentDeliveryId(), orderIds: checkedOrderIds };
        this.collectCompanyDelivery(formValue).subscribe({
          next: (value) => {
            this.optimisticallyMarkOrdersAsCollected(checkedOrderIds);
            onCollectionSuccess(value, checkedOrderIds);
          },
        });
        break;
    }
  }

  private resolveOrderIdsForPrint(): number[] {
    if (this.currentBill()) {
      return [this.currentBill()!.id];
    }
    if (this.isDeliveryDialog()) {
      return [...this.checkedOrderIds()];
    }
    return [];
  }

  canPrintInvoices = computed(() => {
    if (this.currentBill()) {
      return true;
    }
    return this.isDeliveryDialog() && this.checkedOrderIds().length > 0;
  });

  printSelectedInvoices() {
    const orderIds = this.resolveOrderIdsForPrint();
    if (orderIds.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'يرجى اختيار فاتورة للطباعة.',
      });
      return;
    }

    forkJoin(orderIds.map((orderId) => this.orderService.getBill(orderId))).subscribe({
      next: (bills) => this.orderPrintWorkflow.openPrintDialogForBills(bills),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'تعذر تحميل بيانات الفاتورة للطباعة',
        });
      },
    });
  }

  /** Reuses shared Collections print workflow after successful collect. */
  private printCustomerInvoices(orderIds: number[]) {
    if (orderIds.length === 0) {
      return;
    }

    forkJoin(orderIds.map((orderId) => this.orderService.getBill(orderId))).subscribe({
      next: (bills) => this.orderPrintWorkflow.openPrintDialogForBills(bills),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'تعذر تحميل بيانات الفاتورة للطباعة',
        });
      },
    });
  }

  private optimisticallyMarkOrdersAsCollected(orderIds: number[]) {
    this.collectionsService.currentDeliveryOrders.update((orders) =>
      orders.filter((o) => !orderIds.includes(o.orderId)),
    );
    this.collectionsService.collectedOrderIds.set(orderIds);
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

  displayedCashAccounts = computed(() => {
    const accounts = this.cashAccounts();
    const userDetails = this.userDetails();
    const defaultAccount: ITreeFinancialAccountSearchRow | null = userDetails?.cashPaymentAccountId
      ? ({
          id: userDetails.cashPaymentAccountId,
          name: userDetails.cashPaymentAccountName ?? '',
        } as ITreeFinancialAccountSearchRow)
      : null;
    if (!defaultAccount) return [...accounts];
    const hasDefault = accounts.some((a) => a.id === defaultAccount.id);
    if (hasDefault) return [...accounts];
    return [defaultAccount, ...accounts];
  });

  displayedNetworkAccounts = computed(() => {
    const accounts = this.networkAccounts();
    const userDetails = this.userDetails();
    const defaultAccount: ITreeFinancialAccountSearchRow | null = userDetails?.bankPaymentAccountId
      ? ({
          id: userDetails.bankPaymentAccountId,
          name: userDetails.bankPaymentAccountName ?? '',
        } as ITreeFinancialAccountSearchRow)
      : null;
    if (!defaultAccount) return [...accounts];
    const hasDefault = accounts.some((a) => a.id === defaultAccount.id);
    if (hasDefault) return [...accounts];
    return [defaultAccount, ...accounts];
  });

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
  isNumbersKeyboardVisible = signal(false);
  toggleNumbersKeyboard() {
    this.isNumbersKeyboardVisible.update((v) => !v);
  }
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
