import { BaseComponent } from '@/components';
import { Component, input } from '@angular/core';
import { CollectivePaymentForm } from '../../components/collective-payment-form/collective-payment-form';

@Component({
  selector: 'app-add-collective-payment',
  imports: [CollectivePaymentForm],
  templateUrl: './add-collective-payment.html',
  styleUrl: './add-collective-payment.css',
})
export class AddCollectivePayment extends BaseComponent {
  id = input.required<number>();
}
