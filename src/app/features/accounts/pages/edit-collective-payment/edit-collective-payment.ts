import { BaseComponent } from '@/components';
import { Component, input } from '@angular/core';
import { CollectivePaymentForm } from '../../components/collective-payment-form/collective-payment-form';

@Component({
  selector: 'app-edit-collective-payment',
  imports: [CollectivePaymentForm],
  templateUrl: './edit-collective-payment.html',
  styleUrl: './edit-collective-payment.css',
})
export class EditCollectivePayment extends BaseComponent {
  id = input.required<number>();
}
