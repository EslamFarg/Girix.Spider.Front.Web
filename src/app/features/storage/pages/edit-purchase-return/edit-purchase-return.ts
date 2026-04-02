import { Component, input } from '@angular/core';
import { BaseComponent } from '@/components/base-component/base-component';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { PurchaseReturnForm } from '../../components/purchase-return-form/purchase-return-form';

@Component({
  selector: 'app-edit-purchase-return',
  imports: [SectionWrapper, PurchaseReturnForm],
  templateUrl: './edit-purchase-return.html',
  styleUrl: './edit-purchase-return.css',
})
export class EditPurchaseReturn extends BaseComponent {
  id = input.required<number>();
}
