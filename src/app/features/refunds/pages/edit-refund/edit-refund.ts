import { BaseComponent, FormMode } from '@/components';
import { Component } from '@angular/core';
import { RefundForm } from '../../components/refund-form/refund-form';

@Component({
  selector: 'app-edit-refund',
  imports: [RefundForm],
  templateUrl: './edit-refund.html',
  styleUrl: './edit-refund.css',
})
export class EditRefund extends BaseComponent {
  override FormMode = FormMode;
}
