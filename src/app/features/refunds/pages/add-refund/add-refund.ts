import { BaseComponent, FormMode } from '@/components';
import { Component } from '@angular/core';
import { RefundForm } from '../../components/refund-form/refund-form';

@Component({
  selector: 'app-add-refund',
  imports: [RefundForm],
  templateUrl: './add-refund.html',
  styleUrl: './add-refund.css',
})
export class AddRefund extends BaseComponent {
  override FormMode = FormMode;
}
