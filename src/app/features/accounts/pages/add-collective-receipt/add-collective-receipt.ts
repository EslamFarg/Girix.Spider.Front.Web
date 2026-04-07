import { BaseComponent } from '@/components';
import { Component, input } from '@angular/core';
import { CollectiveReceiptForm } from '../../components/collective-receipt-form/collective-receipt-form';

@Component({
  selector: 'app-add-collective-receipt',
  imports: [CollectiveReceiptForm],
  templateUrl: './add-collective-receipt.html',
  styleUrl: './add-collective-receipt.css',
})
export class AddCollectiveReceipt extends BaseComponent {
  id = input.required<number>();
}
