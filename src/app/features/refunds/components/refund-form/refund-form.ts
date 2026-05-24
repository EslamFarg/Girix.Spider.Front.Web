import { Component, computed, inject, input, linkedSignal, OnInit, signal } from '@angular/core';
import { BaseComponent, FormMode } from '@/components/base-component/base-component';
import { RefundService } from '../../services/refund-service';
import {
  IOrderLatestUpdateItem,
  IOrderLatestUpdateModifier,
  IOrderLatestUpdateResponse,
  IRefundResponse,
} from '../../services/refund-types/response';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button, ButtonDirective } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { AllowNumbers } from '@/directives/allow-numbers';
import { TranslatePipe } from '@ngx-translate/core';
import { ControlsOf } from '@/yn-ng/types/helpers';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { OrderPaymentType } from '@/features/orders';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { TagModule } from 'primeng/tag';
import { onlyNumbersOrDotAllowed } from '@/yn-ng';
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

@Component({
  selector: 'app-refund-form',
  imports: [
    Button,
    InputTextModule,
    InputErrorMessageHandler,
    AllowNumbers,
    TranslatePipe,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    DecimalPipe,
    ButtonDirective,
    LoadingDisabledDirective,
    InputGroupAddon,TagModule
],
  templateUrl: './refund-form.html',
  styleUrl: './refund-form.css',
})
export class RefundForm extends BaseComponent implements OnInit {
  refundService = inject(RefundService);

  formMode = input<FormMode>(FormMode.Create);
  refundId = input<number>(0);


  orderData = signal<IOrderLatestUpdateResponse | IRefundResponse | null>(null);
  isOrderPaid= computed(() => this.orderData()?.paymentType === OrderPaymentType.Paid);
  isCreateMode = computed(() => this.formMode() === FormMode.Create);

  refundFg = this.fb.group({
    payingCash: this.fb.control<number>(0, [onlyNumbersOrDotAllowed]),
    payingNetwork: this.fb.control<number>(0, [onlyNumbersOrDotAllowed]),
    items: this.fb.array<FormGroup<RefundItemFormRowControls>>([], [Validators.required]),
  });

  addonArrays = signal<FormArray<FormGroup<RefundAddonFormRowControls>>[]>([]);

  cashInputSubscription = this.refundFg.get('payingCash')?.valueChanges.subscribe((value) => {
    const total = this.calculateRefundTotal();
    const isPaid = this.orderData()?.paymentType === OrderPaymentType.Paid;
    if (!isPaid) return;
    let futureValue = value ?? 0;
    if (futureValue > total) {
      futureValue = total;
    } else if (futureValue < 0) {
      futureValue = 0;
    }
    this.refundFg.patchValue(
      {
        payingNetwork: total - futureValue,
        payingCash: futureValue,
      },
      { emitEvent: false },
    );
  });

  networkInputSubscription = this.refundFg.get('payingNetwork')?.valueChanges.subscribe((value) => {
    const total = this.calculateRefundTotal();
    const isPaid = this.orderData()?.paymentType === OrderPaymentType.Paid;
    if (!isPaid) return;
    let futureValue = value ?? 0;
    if (futureValue > total) {
      futureValue = total;
    } else if (futureValue < 0) {
      futureValue = 0;
    }
    this.refundFg.patchValue(
      {
        payingCash: total - futureValue,
        payingNetwork: futureValue,
      },
      { emitEvent: false },
    );
  });

  get itemRows() {
    return this.refundFg.controls.items;
  }

  ngOnInit() {
    if (this.isCreateMode()) {
      const orderId = Number(this.activatedRoute.snapshot.queryParamMap.get('orderId'));
      if (orderId) {
        this.refundService.getOrderLatestUpdate(orderId).subscribe({
          next: (res) => {
            this.orderData.set(res);
            this.patchFormFromOrder(res);
          },
        });
      }
    } else {
      const id = this.refundId();
      if (id) {
        this.refundService.getById(id).subscribe({
          next: (res) => {
            this.orderData.set(res);
            this.patchFormFromRefund(res);
          },
        });
      }
    }
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

    const total = this.calculateRefundTotal();
    const isPaid = order.paymentType === OrderPaymentType.Paid;
    this.refundFg.patchValue({
      payingCash: isPaid ? total : 0,
      payingNetwork: 0,
    });
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
  }

  createItemRow(item: IOrderLatestUpdateItem): FormGroup<RefundItemFormRowControls> {
    return this.fb.group<RefundItemFormRowControls>({
      orderDetailId: this.fb.control(item.id, { validators: [] }),
      quantity: this.fb.control(item.qty, [Validators.required, Validators.min(0), Validators.max(item.qty)]),
      originalQuantity: this.fb.control(item.qty, { validators: [] }),
      name: this.fb.control(item.name, { validators: [] }),
      unitPrice: this.fb.control(item.unitPrice, { validators: [] }),
      netUnitPriceWithTax: this.fb.control(item.netUnitPriceWithTax, { validators: [] }),
    });
  }

  createItemRowFromRefund(item: IRefundResponse['items'][number]): FormGroup<RefundItemFormRowControls> {
    return this.fb.group<RefundItemFormRowControls>({
      orderDetailId: this.fb.control(item.masterOrderDetailsId, { validators: [] }),
      quantity: this.fb.control(item.qty, [Validators.required, Validators.min(0)]),
      originalQuantity: this.fb.control(item.qty, { validators: [] }),
      name: this.fb.control(item.name, { validators: [] }),
      unitPrice: this.fb.control(item.unitPrice, { validators: [] }),
      netUnitPriceWithTax: this.fb.control(item.netUnitPriceWithTax, { validators: [] }),
    });
  }

  createAddonRow(modifier: IOrderLatestUpdateModifier): FormGroup<RefundAddonFormRowControls> {
    return this.fb.group<RefundAddonFormRowControls>({
      additionalOrderDetailsId: this.fb.control(modifier.id, { validators: [] }),
      quantity: this.fb.control(modifier.qty, [Validators.required, Validators.min(0), Validators.max(modifier.qty)]),
      originalQuantity: this.fb.control(modifier.qty, { validators: [] }),
      name: this.fb.control(modifier.name, { validators: [] }),
      unitPrice: this.fb.control(modifier.unitPrice, { validators: [] }),
      netUnitPriceWithTax: this.fb.control(modifier.netUnitPriceWithTax, { validators: [] }),
    });
  }

  createAddonRowFromRefund(modifier: any): FormGroup<RefundAddonFormRowControls> {
    return this.fb.group<RefundAddonFormRowControls>({
      additionalOrderDetailsId: this.fb.control(modifier.masterOrderDetailsId ?? modifier.id, { validators: [] }),
      quantity: this.fb.control(modifier.qty, [Validators.required, Validators.min(0)]),
      originalQuantity: this.fb.control(modifier.qty, { validators: [] }),
      name: this.fb.control(modifier.name, { validators: [] }),
      unitPrice: this.fb.control(modifier.unitPrice, { validators: [] }),
      netUnitPriceWithTax: this.fb.control(modifier.netUnitPriceWithTax, { validators: [] }),
    });
  }

  getAddonRows(itemIndex: number): FormArray<FormGroup<RefundAddonFormRowControls>> {
    return this.addonArrays()[itemIndex];
  }

  onItemQuantityChange(itemIndex: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const row = this.itemRows.at(itemIndex);
    const max = row.value.originalQuantity ?? 0;
    let val = Number(input.value);

    if (val > max) {
      val = max;
      input.value = String(max);
    }
    if (val < 0) {
      val = 0;
      input.value = '0';
    }
    row.patchValue({ quantity: val });
    this.syncPaymentWithTotal();
  }

  onAddonQuantityChange(itemIndex: number, addonIndex: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const row = this.getAddonRows(itemIndex).at(addonIndex);
    const max = row.value.originalQuantity ?? 0;
    let val = Number(input.value);

    if (val > max) {
      val = max;
      input.value = String(max);
    }
    if (val < 0) {
      val = 0;
      input.value = '0';
    }
    row.patchValue({ quantity: val });
    this.syncPaymentWithTotal();
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
    const summary = (this.orderData() as any)?.summary;
    const originalServiceFee = summary?.serviceFee ?? 0;
    if (originalServiceFee <= 0) return 0;

    let refundedQtySum = 0;
    let originalQtySum = 0;

    for (let i = 0; i < this.itemRows.controls.length; i++) {
      const item = this.itemRows.controls[i];
      const itemQty = item.value.quantity ?? 0;
      const itemOriginalQty = item.value.originalQuantity ?? 0;

      refundedQtySum += itemQty;
      originalQtySum += itemOriginalQty;

      const addons = this.addonArrays()[i]?.controls ?? [];
      for (const addon of addons) {
        refundedQtySum += addon.value.quantity ?? 0;
        originalQtySum += addon.value.originalQuantity ?? 0;
      }
    }

    if (originalQtySum === 0) return 0;

    const ratio = refundedQtySum / originalQtySum;
    return originalServiceFee * ratio;
  }

  calculateRefundTotal(): number {
    return this.calculateItemsTotal() + this.calculateReturnedServiceFee();
  }

  syncPaymentWithTotal() {
    const total = this.calculateRefundTotal();
    this.refundFg.patchValue({
      payingCash: total,
      payingNetwork: 0,
    });
  }

  onSubmitForm() {
    if (this.refundFg.invalid) {
      this.refundFg.markAllAsTouched();
      return;
    }

    const items = this.itemRows.controls
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

    if (items.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'يجب اختيار عنصر واحد على الأقل للاسترجاع',
      });
      return;
    }

    if (this.isCreateMode()) {
      const orderId = Number(this.activatedRoute.snapshot.queryParamMap.get('orderId'));

      const isPaid = this.orderData()?.paymentType === OrderPaymentType.Paid;

      const payload = {
        orderMasterId: orderId,
        payingCash: isPaid ? +(this.refundFg.value.payingCash ?? 0).toFixed(2) : 0,
        payingNetwork: isPaid ? +(this.refundFg.value.payingNetwork ?? 0).toFixed(2) : 0,
        createAt: this.localDateIso,
        idempotencyKey: crypto.randomUUID(),
        items,
      };
      this.refundService.create(payload).subscribe({
        next: () => this.router.navigate(['/invoices/refunds']),
      });
    } else {
      const payload = {
        id: this.refundId(),
        paymentType: (this.orderData() as IRefundResponse)?.paymentType ?? 0,
        payingCash: +(this.refundFg.value.payingCash ?? 0).toFixed(2),
        payingNetwork: +(this.refundFg.value.payingNetwork ?? 0).toFixed(2),
        items,
      };
      this.refundService.put(payload).subscribe({
        next: () => this.router.navigate(['/invoices/refunds']),
      });
    }
  }
}
