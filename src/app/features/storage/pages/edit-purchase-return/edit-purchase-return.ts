import { Component, input } from '@angular/core';
import { BaseComponent } from '@/components/base-component/base-component';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { PurchasesRefundsForm } from '../../components/purchases-refunds-form/purchases-refunds-form';

@Component({
  selector: 'app-edit-purchase-return',
  imports: [SectionWrapper, PurchasesRefundsForm],
  templateUrl: './edit-purchase-return.html',
  styleUrl: './edit-purchase-return.css',
})
export class EditPurchaseReturn extends BaseComponent {
  id = input.required<number>();
}
