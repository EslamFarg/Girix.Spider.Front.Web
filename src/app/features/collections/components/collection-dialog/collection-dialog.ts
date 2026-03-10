import { Component, computed, effect, inject, signal } from '@angular/core';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { CollectionsService } from '../../services/collections-service';
import { PrintableOrderInvoice } from '@/features/orders/components/printable-order-invoice/printable-order-invoice';
import { OrderService } from '@/features/orders';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseComponent } from '@/components';
import { ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { AllowNumbers } from '@/directives/allow-numbers';
import { NumbersKeyboard } from '@/features/keyboard/components/numbers-keyboard/numbers-keyboard';
import { KeyboardService } from '@/features/keyboard/services/keyboard-service';

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

  closeCollectionInvoiceDialog() {
    this.collectionsService.closeCollectionInvoiceDialog();
  }

  initialPaymentFgValue = {
    orderId: this.fb.control<number | null>(0, [Validators.required]),
    cashPaymentAmount: this.fb.control<number | null>(0, []),
    networkPaymentAmount: this.fb.control<number | null>(0, []),
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
