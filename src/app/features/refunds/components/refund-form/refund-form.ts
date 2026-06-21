import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { BaseComponent, FormMode } from '@/components/base-component/base-component';
import { RefundService, RefundSearchEnum } from '../../services/refund-service';
import {
  IOrderLatestUpdateItem,
  IOrderLatestUpdateModifier,
  IOrderLatestUpdateResponse,
  IRefundResponse,
} from '../../services/refund-types/response';
import { FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { ControlsOf } from '@/yn-ng/types/helpers';
import { DatePipe, DecimalPipe } from '@angular/common';
import { OrderLocationType, OrderPaymentType, OrderService } from '@/features/orders';
import { OrderSearchEnum } from '@/features/orders/types/api/enums';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { TagModule } from 'primeng/tag';
import { onlyNumbersOrDotAllowed } from '@/yn-ng';
import { Dialog } from 'primeng/dialog';
import { DailyJournalService } from '@/features/settings/services/daily-journal-service';
import { OpenDailyJournal } from '@/features/settings/components/open-daily-journal/open-daily-journal';
import { A4PrintService } from '@/core';
import { Debounce } from '@/directives/debounce';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { buildSalesReturnPrintHtml, getPaymentMethodLabel, IRefundPrintLine } from '../../utils/refund-print.util';

interface IRefundItemFormRow {
  orderDetailId: number;
  quantity: number;
  originalQuantity: number;
  name: string;
  unitPrice: number;
  netUnitPriceWithTax: number;
}

interface IRefundAddonFormRow {
  additionalOrderDetailsId: number;
  quantity: number;
  originalQuantity: number;
  name: string;
  unitPrice: number;
  netUnitPriceWithTax: number;
}

type RefundItemFormRowControls = ControlsOf<IRefundItemFormRow>;
type RefundAddonFormRowControls = ControlsOf<IRefundAddonFormRow>;

const ORDER_TYPE_LABELS: Record<number, string> = {
  [OrderLocationType.DineIn]: 'محلي',
  [OrderLocationType.Takeaway]: 'سفري',
  [OrderLocationType.PersonDelivery]: 'توصيل',
  [OrderLocationType.CompanyDelivery]: 'شركة',
};

@Component({
  selector: 'app-refund-form',
  imports: [
    InputTextModule,
    InputErrorMessageHandler,
    ReactiveFormsModule,
    FormsModule,
    DecimalPipe,
    ButtonDirective,
    LoadingDisabledDirective,
    TagModule,
    DatePipe,
    Dialog,
    OpenDailyJournal,
    Debounce,
    InputGroupAddon,
    TooltipModule,
    CheckboxModule,
  ],
  templateUrl: './refund-form.html',
  styleUrl: './refund-form.css',
})
export class RefundForm extends BaseComponent implements OnInit {
  refundService = inject(RefundService);
  orderService = inject(OrderService);
  dailyJournalService = inject(DailyJournalService);
  a4PrintService = inject(A4PrintService);

  formMode = input<FormMode>(FormMode.Create);
  refundId = input<number>(0);

  OrderPaymentType = OrderPaymentType;

  searchInvoiceFg = this.fb.group({ term: this.fb.control('') });
  searchReturnFg = this.fb.group({ term: this.fb.control('') });

  orderData = signal<IOrderLatestUpdateResponse | IRefundResponse | null>(null);
  qtyRevision = signal(0);
  returnAllChecked = signal(false);

  isOrderPaid = computed(() => this.orderData()?.paymentType === OrderPaymentType.Paid);
  isCreateMode = computed(() => this.formMode() === FormMode.Create);
  isLoaded = computed(() => this.orderData() !== null);

  submitLabel = computed(() => (this.isCreateMode() ? 'حفظ' : 'تعديل'));
  canSubmit = computed(() => this.isLoaded() && (this.isCreateMode() || this.refundId() > 0));
  canDelete = computed(() => !this.isCreateMode() && this.isLoaded() && this.refundId() > 0);
  canPrint = computed(() => !this.isCreateMode() && this.isLoaded() && this.refundId() > 0);

  invoiceTotal = computed(() => this.orderData()?.summary?.totalNet ?? 0);
  previousReturnsTotal = computed(() => this.orderData()?.summary?.netReturnOrder ?? 0);
  remainingReturnable = computed(() =>
    Math.max(0, +(this.invoiceTotal() - this.previousReturnsTotal()).toFixed(2)),
  );
  orderTypeLabel = computed(() => {
    const type = this.orderData()?.orderType;
    return type != null ? (ORDER_TYPE_LABELS[type] ?? '-') : '-';
  });
  originalInvoiceNumber = computed(
    () => this.orderData()?.orderNumber ?? this.orderData()?.orderMasterId ?? '-',
  );
  returnNumberDisplay = computed(() =>
    this.isCreateMode() ? '-' : String(this.refundId() || (this.orderData() as IRefundResponse)?.id || '-'),
  );

  cashAccountName = computed(() => this.authService.userDetails()?.cashPaymentAccountName ?? '-');
  networkAccountName = computed(() => this.authService.userDetails()?.bankPaymentAccountName ?? '-');

  totalSoldQuantity = computed(() => {
    this.qtyRevision();
    return this.sumQuantities('originalQuantity');
  });

  totalReturnedQuantity = computed(() => {
    this.qtyRevision();
    return this.sumQuantities('quantity');
  });

  totalReturnAmount = computed(() => {
    this.qtyRevision();
    return this.calculateRefundTotal();
  });

  selectedItemsCount = computed(() => {
    this.qtyRevision();
    let count = 0;
    for (let i = 0; i < this.itemRows.length; i++) {
      const item = this.itemRows.at(i);
      if ((item.value.quantity ?? 0) > 0) count++;
      const addons = this.addonArrays()[i]?.controls ?? [];
      for (const addon of addons) {
        if ((addon.value.quantity ?? 0) > 0) count++;
      }
    }
    return count;
  });

  journalWarningDialogVisible = signal(false);
  openJournalDialogVisible = signal(false);
  pendingSaveMode = signal<'create' | 'update' | null>(null);

  refundFg = this.fb.group({
    payingCash: this.fb.control<number>(0, [onlyNumbersOrDotAllowed]),
    payingNetwork: this.fb.control<number>(0, [onlyNumbersOrDotAllowed]),
    items: this.fb.array<FormGroup<RefundItemFormRowControls>>([], [Validators.required]),
  });

  addonArrays = signal<FormArray<FormGroup<RefundAddonFormRowControls>>[]>([]);

  constructor() {
    super();

    effect(() => {
      const daily = this.dailyJournalService.currentUserDaily();
      if (daily?.value?.dailyJournalPeriods?.isOpening && this.pendingSaveMode()) {
        this.openJournalDialogVisible.set(false);
        this.journalWarningDialogVisible.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'تم فتح اليومية',
          detail: 'تم فتح اليومية بنجاح. جاري حفظ المرتجع...',
        });
        const mode = this.pendingSaveMode();
        this.pendingSaveMode.set(null);
        if (mode === 'create') this.executeCreate();
        else if (mode === 'update') this.executeUpdate();
      }
    });
  }

  get itemRows() {
    return this.refundFg.controls.items;
  }

  ngOnInit() {
    if (this.isCreateMode()) {
      this.activatedRoute.queryParamMap.subscribe((params) => {
        const orderId = Number(params.get('orderId'));
        if (orderId) {
          this.loadOrderForCreate(orderId);
        } else {
          this.resetEmptyCreateState();
        }
      });
    } else if (this.refundId()) {
      this.searchReturnFg.patchValue({ term: String(this.refundId()) });
      this.refundService.getById(this.refundId()).subscribe({
        next: (res) => this.onRefundLoaded(res),
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'تعذر تحميل بيانات المرتجع.',
          });
        },
      });
    }
  }

  private loadOrderForCreate(orderId: number) {
    this.refundService.getOrderLatestUpdate(orderId).subscribe({
      next: (res) => this.onOrderLoaded(res),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'تعذر تحميل بيانات الفاتورة للاسترجاع.',
        });
      },
    });
  }

  private resetEmptyCreateState() {
    this.orderData.set(null);
    this.itemRows.clear();
    this.addonArrays.set([]);
    this.refundFg.reset({ payingCash: 0, payingNetwork: 0 });
    this.searchInvoiceFg.reset({ term: '' });
    this.returnAllChecked.set(false);
    this.bumpQtyRevision();
  }

  private onOrderLoaded(order: IOrderLatestUpdateResponse) {
    const remaining = Math.max(0, (order.summary?.totalNet ?? 0) - (order.summary?.netReturnOrder ?? 0));
    if (!order.items?.length || order.items.every((i) => (i.qty ?? 0) <= 0)) {
      this.messageService.add({
        severity: 'error',
        summary: 'لا يمكن الاسترجاع',
        detail: 'تم استرجاع هذه الفاتورة بالكامل ولا توجد كميات متبقية.',
      });
    }
    if (remaining <= 0 && (order.summary?.totalNet ?? 0) > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'لا يوجد مبلغ متبقٍ للاسترجاع على هذه الفاتورة.',
      });
    }
    this.orderData.set(order);
    this.searchInvoiceFg.patchValue({
      term: String(order.orderNumber ?? order.orderMasterId ?? ''),
    });
    this.patchFormFromOrder(order);
  }

  private onRefundLoaded(refund: IRefundResponse) {
    this.orderData.set(refund);
    this.searchInvoiceFg.patchValue({
      term: String(refund.orderNumber ?? refund.orderMasterId ?? ''),
    });
    this.searchReturnFg.patchValue({ term: String(refund.id) });
    this.patchFormFromRefund(refund);
  }

  patchFormFromOrder(order: IOrderLatestUpdateResponse) {
    const itemsArray = this.fb.array<FormGroup<RefundItemFormRowControls>>(
      order.items.map((item) => this.createItemRow(item)),
      [Validators.required],
    );
    this.refundFg.setControl('items', itemsArray);
    this.addonArrays.set(
      order.items.map((item) =>
        this.fb.array<FormGroup<RefundAddonFormRowControls>>(item.modifiers.map((mod) => this.createAddonRow(mod))),
      ),
    );
    this.refundFg.patchValue({ payingCash: 0, payingNetwork: 0 });
    this.syncReturnAllCheckbox();
    this.bumpQtyRevision();
  }

  patchFormFromRefund(refund: IRefundResponse) {
    const itemsArray = this.fb.array<FormGroup<RefundItemFormRowControls>>(
      refund.items.map((item) => this.createItemRowFromRefund(item)),
      [Validators.required],
    );
    this.refundFg.setControl('items', itemsArray);
    this.addonArrays.set(
      refund.items.map((item) =>
        this.fb.array<FormGroup<RefundAddonFormRowControls>>(
          (item.modifiers ?? []).map((mod: any) => this.createAddonRowFromRefund(mod)),
        ),
      ),
    );
    this.refundFg.patchValue({
      payingCash: refund.payments.payingCash,
      payingNetwork: refund.payments.payingNetwork,
    });
    this.syncReturnAllCheckbox();
    this.bumpQtyRevision();
  }

  createItemRow(item: IOrderLatestUpdateItem): FormGroup<RefundItemFormRowControls> {
    const maxQty = item.qty ?? 0;
    return this.fb.group<RefundItemFormRowControls>({
      orderDetailId: this.fb.control(item.id, { validators: [] }),
      quantity: this.fb.control(0, [Validators.required, Validators.min(0), Validators.max(maxQty)]),
      originalQuantity: this.fb.control(maxQty, { validators: [] }),
      name: this.fb.control(item.name, { validators: [] }),
      unitPrice: this.fb.control(item.unitPrice, { validators: [] }),
      netUnitPriceWithTax: this.fb.control(item.netUnitPriceWithTax, { validators: [] }),
    });
  }

  createItemRowFromRefund(item: IRefundResponse['items'][number]): FormGroup<RefundItemFormRowControls> {
    const maxQty = item.realQtyInMasterOrder ?? item.qty ?? 0;
    return this.fb.group<RefundItemFormRowControls>({
      orderDetailId: this.fb.control(item.masterOrderDetailsId, { validators: [] }),
      quantity: this.fb.control(item.qty, [Validators.required, Validators.min(0), Validators.max(maxQty)]),
      originalQuantity: this.fb.control(maxQty, { validators: [] }),
      name: this.fb.control(item.name, { validators: [] }),
      unitPrice: this.fb.control(item.unitPrice, { validators: [] }),
      netUnitPriceWithTax: this.fb.control(item.netUnitPriceWithTax, { validators: [] }),
    });
  }

  createAddonRow(modifier: IOrderLatestUpdateModifier): FormGroup<RefundAddonFormRowControls> {
    const maxQty = modifier.qty ?? 0;
    return this.fb.group<RefundAddonFormRowControls>({
      additionalOrderDetailsId: this.fb.control(modifier.id, { validators: [] }),
      quantity: this.fb.control(0, [Validators.required, Validators.min(0), Validators.max(maxQty)]),
      originalQuantity: this.fb.control(maxQty, { validators: [] }),
      name: this.fb.control(modifier.name, { validators: [] }),
      unitPrice: this.fb.control(modifier.unitPrice, { validators: [] }),
      netUnitPriceWithTax: this.fb.control(modifier.netUnitPriceWithTax, { validators: [] }),
    });
  }

  createAddonRowFromRefund(modifier: {
    id?: number;
    masterOrderDetailsId?: number;
    qty?: number;
    realQtyInMasterOrder?: number;
    name?: string;
    unitPrice?: number;
    netUnitPriceWithTax?: number;
  }): FormGroup<RefundAddonFormRowControls> {
    const maxQty = modifier.realQtyInMasterOrder ?? modifier.qty ?? 0;
    return this.fb.group<RefundAddonFormRowControls>({
      additionalOrderDetailsId: this.fb.control(modifier.masterOrderDetailsId ?? modifier.id ?? 0, {
        validators: [],
      }),
      quantity: this.fb.control(modifier.qty ?? 0, [Validators.required, Validators.min(0), Validators.max(maxQty)]),
      originalQuantity: this.fb.control(maxQty, { validators: [] }),
      name: this.fb.control(modifier.name ?? '', { validators: [] }),
      unitPrice: this.fb.control(modifier.unitPrice ?? 0, { validators: [] }),
      netUnitPriceWithTax: this.fb.control(modifier.netUnitPriceWithTax ?? 0, { validators: [] }),
    });
  }

  getAddonRows(itemIndex: number): FormArray<FormGroup<RefundAddonFormRowControls>> {
    return this.addonArrays()[itemIndex];
  }

  isRowActive(itemIndex: number): boolean {
    const item = this.itemRows.at(itemIndex);
    if ((item.value.quantity ?? 0) > 0) return true;
    const addons = this.getAddonRows(itemIndex)?.controls ?? [];
    return addons.some((a) => (a.value.quantity ?? 0) > 0);
  }

  hasReturnedQuantity(qty: number | null | undefined): boolean {
    return (qty ?? 0) > 0;
  }

  adjustItemQuantity(itemIndex: number, delta: number) {
    const row = this.itemRows.at(itemIndex);
    this.applyQuantityDelta(row, delta, row.value.name ?? 'الصنف');
  }

  adjustAddonQuantity(itemIndex: number, addonIndex: number, delta: number) {
    const row = this.getAddonRows(itemIndex).at(addonIndex);
    this.applyQuantityDelta(row, delta, row.value.name ?? 'الإضافة');
  }

  private applyQuantityDelta(
    row: FormGroup<RefundItemFormRowControls> | FormGroup<RefundAddonFormRowControls>,
    delta: number,
    label: string,
  ) {
    const max = row.value.originalQuantity ?? 0;
    const current = row.value.quantity ?? 0;
    const next = Math.min(max, Math.max(0, +(current + delta).toFixed(3)));
    if (delta > 0 && current >= max) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: `الكمية المدخلة أكبر من المتاح (${max}) لـ "${label}".`,
      });
    }
    row.patchValue({ quantity: next });
    row.controls.quantity.updateValueAndValidity();
    this.syncPaymentWithTotal();
    this.syncReturnAllCheckbox();
    this.bumpQtyRevision();
  }

  onReturnAllCheckboxChange(checked: boolean) {
    this.returnAllChecked.set(checked);
    for (let i = 0; i < this.itemRows.length; i++) {
      const item = this.itemRows.at(i);
      const target = checked ? (item.value.originalQuantity ?? 0) : 0;
      item.patchValue({ quantity: target });
      const addons = this.getAddonRows(i)?.controls ?? [];
      addons.forEach((addon) =>
        addon.patchValue({ quantity: checked ? (addon.value.originalQuantity ?? 0) : 0 }),
      );
    }
    this.syncPaymentWithTotal();
    this.bumpQtyRevision();
  }

  private syncReturnAllCheckbox() {
    let hasReturnable = false;
    let allAtMax = true;

    for (let i = 0; i < this.itemRows.length; i++) {
      const item = this.itemRows.at(i);
      const itemMax = item.value.originalQuantity ?? 0;
      if (itemMax > 0) {
        hasReturnable = true;
        if ((item.value.quantity ?? 0) !== itemMax) allAtMax = false;
      }
      const addons = this.getAddonRows(i)?.controls ?? [];
      for (const addon of addons) {
        const addonMax = addon.value.originalQuantity ?? 0;
        if (addonMax > 0) {
          hasReturnable = true;
          if ((addon.value.quantity ?? 0) !== addonMax) allAtMax = false;
        }
      }
    }

    this.returnAllChecked.set(hasReturnable && allAtMax);
  }

  deleteRow(itemIndex: number) {
    if (this.isCreateMode()) {
      this.itemRows.removeAt(itemIndex);
      this.addonArrays.update((arr) => {
        const next = [...arr];
        next.splice(itemIndex, 1);
        return next;
      });
    } else {
      this.itemRows.at(itemIndex).patchValue({ quantity: 0 });
      const addons = this.getAddonRows(itemIndex)?.controls ?? [];
      addons.forEach((addon) => addon.patchValue({ quantity: 0 }));
    }
    this.syncPaymentWithTotal();
    this.syncReturnAllCheckbox();
    this.bumpQtyRevision();
  }

  deleteAddonRow(itemIndex: number, addonIndex: number) {
    if (this.isCreateMode()) {
      this.getAddonRows(itemIndex).removeAt(addonIndex);
    } else {
      this.getAddonRows(itemIndex).at(addonIndex).patchValue({ quantity: 0 });
    }
    this.syncPaymentWithTotal();
    this.syncReturnAllCheckbox();
    this.bumpQtyRevision();
  }

  private sumQuantities(field: 'quantity' | 'originalQuantity'): number {
    let sum = 0;
    for (let i = 0; i < this.itemRows.length; i++) {
      const item = this.itemRows.at(i);
      sum += item.value[field] ?? 0;
      const addons = this.addonArrays()[i]?.controls ?? [];
      for (const addon of addons) {
        sum += addon.value[field] ?? 0;
      }
    }
    return +sum.toFixed(3);
  }

  private bumpQtyRevision() {
    this.qtyRevision.update((n) => n + 1);
  }

  calculateItemTotal(itemRow: FormGroup<RefundItemFormRowControls>, itemIndex: number): number {
    const qty = itemRow.value.quantity ?? 0;
    const addons = this.addonArrays()[itemIndex]?.controls ?? [];
    const itemTotal = qty * (itemRow.value.netUnitPriceWithTax ?? 0);
    const addonsTotal = addons.reduce(
      (sum, a) => sum + (a.value.quantity ?? 0) * (a.value.netUnitPriceWithTax ?? 0),
      0,
    );
    return itemTotal + addonsTotal;
  }

  calculateItemsTotal(): number {
    return this.itemRows.controls.reduce((sum, item, index) => sum + this.calculateItemTotal(item, index), 0);
  }

  calculateReturnedServiceFee(): number {
    const summary = this.orderData()?.summary;
    const originalServiceFee = summary?.serviceFee ?? 0;
    if (originalServiceFee <= 0) return 0;

    let refundedQtySum = 0;
    let originalQtySum = 0;
    for (let i = 0; i < this.itemRows.length; i++) {
      const item = this.itemRows.at(i);
      refundedQtySum += item.value.quantity ?? 0;
      originalQtySum += item.value.originalQuantity ?? 0;
      const addons = this.addonArrays()[i]?.controls ?? [];
      for (const addon of addons) {
        refundedQtySum += addon.value.quantity ?? 0;
        originalQtySum += addon.value.originalQuantity ?? 0;
      }
    }
    if (originalQtySum === 0) return 0;
    return originalServiceFee * (refundedQtySum / originalQtySum);
  }

  calculateRefundTotal(): number {
    return +(this.calculateItemsTotal() + this.calculateReturnedServiceFee()).toFixed(2);
  }

  syncPaymentWithTotal() {
    if (!this.isOrderPaid()) return;
    const total = this.calculateRefundTotal();
    this.refundFg.patchValue({ payingCash: total, payingNetwork: 0 }, { emitEvent: false });
  }

  private buildSubmitItems() {
    return this.itemRows.controls
      .map((item, index) => ({
        orderDetailId: item.value.orderDetailId!,
        quantity: item.value.quantity ?? 0,
        addons: (this.addonArrays()[index]?.controls ?? [])
          .map((addon) => ({
            additionalOrderDetailsId: addon.value.additionalOrderDetailsId!,
            quantity: addon.value.quantity ?? 0,
          }))
          .filter((a) => a.quantity > 0),
      }))
      .filter((item) => item.quantity > 0 || item.addons.length > 0);
  }

  private validateBeforeSave(): boolean {
    const items = this.buildSubmitItems();
    if (items.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'يجب اختيار عنصر واحد على الأقل للاسترجاع.',
      });
      return false;
    }

    for (let i = 0; i < this.itemRows.length; i++) {
      const item = this.itemRows.at(i);
      const qty = item.value.quantity ?? 0;
      const max = item.value.originalQuantity ?? 0;
      if (qty > max) {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: `كمية "${item.value.name}" أكبر من الكمية المتاحة (${max}).`,
        });
        return false;
      }
      const addons = this.getAddonRows(i)?.controls ?? [];
      for (const addon of addons) {
        const aQty = addon.value.quantity ?? 0;
        const aMax = addon.value.originalQuantity ?? 0;
        if (aQty > aMax) {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: `كمية "${addon.value.name}" أكبر من الكمية المتاحة (${aMax}).`,
          });
          return false;
        }
      }
    }

    const refundTotal = this.calculateRefundTotal();
    if (refundTotal > this.remainingReturnable() + 0.01) {
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: `إجمالي المرتجع (${refundTotal.toFixed(2)}) يتجاوز المتبقي للاسترجاع (${this.remainingReturnable().toFixed(2)}).`,
      });
      return false;
    }

    if (this.isOrderPaid()) {
      const cash = +(this.refundFg.value.payingCash ?? 0);
      const network = +(this.refundFg.value.payingNetwork ?? 0);
      const payTotal = +(cash + network).toFixed(2);
      if (Math.abs(payTotal - refundTotal) > 0.02) {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'مجموع الاسترداد النقدي والشبكة يجب أن يساوي إجمالي المرتجع.',
        });
        return false;
      }
    }

    return true;
  }

  onSubmitClick() {
    if (!this.validateBeforeSave()) return;
    const mode = this.isCreateMode() ? 'create' : 'update';
    if (this.isOrderPaid()) {
      this.checkDailyJournalAndSave(mode);
    } else if (mode === 'create') {
      this.executeCreate();
    } else {
      this.executeUpdate();
    }
  }

  searchBySalesInvoice(rawTerm: string) {
    const term = rawTerm?.trim();
    if (!term) return;

    const trySearch = (column: OrderSearchEnum) =>
      this.orderService.search({
        paginationInfo: { pageIndex: 1, pageSize: 1 },
        searchFilters: [{ column, values: [term] }],
        fromDate: null,
      });

    trySearch(OrderSearchEnum.OrderNumber).subscribe({
      next: (res) => {
        const payload = this.unwrapSearchPayload<{ rows?: { id: number }[] }>(res);
        const row = payload?.rows?.[0];
        if (row) {
          this.navigateToCreateForOrder(row.id);
          return;
        }
        if (/^\d+$/.test(term)) {
          trySearch(OrderSearchEnum.Id).subscribe({
            next: (idRes) => {
              const idPayload = this.unwrapSearchPayload<{ rows?: { id: number }[] }>(idRes);
              const byId = idPayload?.rows?.[0];
              if (byId) this.navigateToCreateForOrder(byId.id);
              else this.notifyInvoiceNotFound();
            },
            error: () => this.notifyInvoiceNotFound(),
          });
        } else {
          this.notifyInvoiceNotFound();
        }
      },
      error: () => this.notifyInvoiceNotFound(),
    });
  }

  searchByReturnReference(rawTerm: string) {
    const term = rawTerm?.trim();
    if (!term) return;

    const loadReturn = (id: number) => {
      this.router.navigate(['/invoices/refunds', id, 'edit']);
    };

    const tryRefundSearch = (column: RefundSearchEnum) =>
      this.refundService.search({
        paginationInfo: { pageIndex: 1, pageSize: 1 },
        searchFilters: [{ column, values: [term] }],
        fromDate: null,
      });

    tryRefundSearch(RefundSearchEnum.Id).subscribe({
      next: (res) => {
        const payload = this.unwrapSearchPayload<{ rows?: { id: number }[] }>(res);
        const row = payload?.rows?.[0];
        if (row) {
          loadReturn(row.id);
          return;
        }
        tryRefundSearch(RefundSearchEnum.ReferenceNumber).subscribe({
          next: (refRes) => {
            const refPayload = this.unwrapSearchPayload<{ rows?: { id: number }[] }>(refRes);
            const refRow = refPayload?.rows?.[0];
            if (refRow) loadReturn(refRow.id);
            else this.notifyReturnNotFound();
          },
          error: () => this.notifyReturnNotFound(),
        });
      },
      error: () => this.notifyReturnNotFound(),
    });
  }

  private unwrapSearchPayload<T>(res: unknown): T {
    return ('value' in (res as object) ? (res as { value?: T }).value : res) as T;
  }

  private navigateToCreateForOrder(orderId: number) {
    const currentOrderId = Number(this.activatedRoute.snapshot.queryParamMap.get('orderId'));
    if (this.isCreateMode() && currentOrderId === orderId) {
      this.refundService.getOrderLatestUpdate(orderId).subscribe({
        next: (res) => this.onOrderLoaded(res),
        error: () => this.notifyInvoiceNotFound(),
      });
      return;
    }
    this.router.navigate(['/invoices/refunds/add'], { queryParams: { orderId } });
  }

  private notifyInvoiceNotFound() {
    this.messageService.add({
      severity: 'warn',
      summary: 'بحث',
      detail: 'لم يتم العثور على فاتورة مبيعات بهذا الرقم.',
    });
  }

  private notifyReturnNotFound() {
    this.messageService.add({
      severity: 'warn',
      summary: 'بحث',
      detail: 'لم يتم العثور على مرتجع بهذا الرقم.',
    });
  }

  private checkDailyJournalAndSave(mode: 'create' | 'update') {
    this.dailyJournalService.getCurrentUserDaily().subscribe({
      next: (res) => {
        if (res.isOpening) {
          if (mode === 'create') this.executeCreate();
          else this.executeUpdate();
        } else {
          this.pendingSaveMode.set(mode);
          this.journalWarningDialogVisible.set(true);
        }
      },
      error: () => {
        this.pendingSaveMode.set(mode);
        this.journalWarningDialogVisible.set(true);
      },
    });
  }

  openJournal() {
    this.dailyJournalService.currentUserId = this.dailyJournalService.loggedInUserId;
    this.journalWarningDialogVisible.set(false);
    this.openJournalDialogVisible.set(true);
  }

  cancelJournalSave() {
    this.journalWarningDialogVisible.set(false);
    this.pendingSaveMode.set(null);
  }

  private executeCreate() {
    const orderId = Number(this.activatedRoute.snapshot.queryParamMap.get('orderId'));
    const isPaid = this.isOrderPaid();
    const payload = {
      orderMasterId: orderId,
      payingCash: isPaid ? +(this.refundFg.value.payingCash ?? 0).toFixed(2) : 0,
      payingNetwork: isPaid ? +(this.refundFg.value.payingNetwork ?? 0).toFixed(2) : 0,
      createAt: this.localDateIso,
      idempotencyKey: crypto.randomUUID(),
      items: this.buildSubmitItems(),
    };

    this.refundService.create(payload).subscribe({
      next: (newId) => {
        const id = typeof newId === 'number' ? newId : Number(newId);
        this.router.navigate(['/invoices/refunds', id, 'edit']);
      },
    });
  }

  private executeUpdate() {
    const payload = {
      id: this.refundId(),
      paymentType: this.orderData()?.paymentType ?? 0,
      payingCash: +(this.refundFg.value.payingCash ?? 0).toFixed(2),
      payingNetwork: +(this.refundFg.value.payingNetwork ?? 0).toFixed(2),
      items: this.buildSubmitItems(),
    };

    this.refundService.put(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'تم',
          detail: 'تم تحديث المرتجع بنجاح.',
        });
        this.refundService.getById(this.refundId()).subscribe({
          next: (res) => {
            this.orderData.set(res);
            this.patchFormFromRefund(res);
          },
        });
      },
    });
  }

  onNewClick() {
    if (this.isCreateMode()) {
      this.router.navigate(['/invoices/refunds/add']);
      this.resetEmptyCreateState();
    } else {
      this.router.navigate(['/invoices/refunds/add']);
    }
  }

  printReturn() {
    const data = this.orderData();
    if (!data || !this.refundId()) return;

    const lines: IRefundPrintLine[] = [];
    for (let i = 0; i < this.itemRows.length; i++) {
      const item = this.itemRows.at(i);
      const qty = item.value.quantity ?? 0;
      if (qty > 0) {
        lines.push({
          name: item.value.name ?? '',
          quantity: qty,
          unitPrice: item.value.netUnitPriceWithTax ?? 0,
          lineTotal: qty * (item.value.netUnitPriceWithTax ?? 0),
        });
      }
      const addons = this.getAddonRows(i)?.controls ?? [];
      for (const addon of addons) {
        const aQty = addon.value.quantity ?? 0;
        if (aQty > 0) {
          lines.push({
            name: addon.value.name ?? '',
            quantity: aQty,
            unitPrice: addon.value.netUnitPriceWithTax ?? 0,
            lineTotal: aQty * (addon.value.netUnitPriceWithTax ?? 0),
            isAddon: true,
          });
        }
      }
    }

    const payingCash = this.refundFg.value.payingCash ?? 0;
    const payingNetwork = this.refundFg.value.payingNetwork ?? 0;

    this.a4PrintService.print(
      buildSalesReturnPrintHtml({
        returnNumber: (data as IRefundResponse).id ?? this.refundId(),
        originalInvoiceNumber: data.orderNumber ?? data.orderMasterId,
        customerName: data.customer?.name ?? '-',
        date: data.dateTime,
        userName: this.authService.userDetails()?.fullName ?? '-',
        returnReason: '-',
        orderTypeLabel: this.orderTypeLabel(),
        paymentMethodLabel: getPaymentMethodLabel(payingCash, payingNetwork, this.isOrderPaid()),
        payingCash,
        payingNetwork,
        total: this.calculateRefundTotal(),
        lines,
      }),
    );
  }

  deleteRefund(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل أنت متأكد من حذف المرتجع؟',
      header: 'حذف المرتجع',
      icon: 'pi pi-info-circle',
      rejectLabel: 'إلغاء',
      rejectButtonProps: { label: 'إلغاء', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'حذف', severity: 'danger' },
      accept: () =>
        this.refundService.delete(this.refundId()).subscribe({
          next: () => this.router.navigate(['/invoices/refunds']),
        }),
    });
  }
}
