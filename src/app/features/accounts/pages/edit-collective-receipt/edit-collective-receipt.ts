import { BaseComponent } from '@/components';
import { Component, input } from '@angular/core';
import { CollectiveReceiptForm } from '../../components/collective-receipt-form/collective-receipt-form';

@Component({
  selector: 'app-edit-collective-receipt',
  imports: [CollectiveReceiptForm],
  templateUrl: './edit-collective-receipt.html',
  styleUrl: './edit-collective-receipt.css',
})
export class EditCollectiveReceipt extends BaseComponent {
  id = input.required<number>();
}
