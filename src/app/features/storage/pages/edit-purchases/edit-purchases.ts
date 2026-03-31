import { Component, input } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { BaseComponent } from '@/components/base-component/base-component';
import { PurchasesForm } from '../../components/purchases-form/purchases-form';

@Component({
  selector: 'app-edit-purchases',
  imports: [SectionWrapper, PurchasesForm],
  templateUrl: './edit-purchases.html',
  styleUrl: './edit-purchases.css',
})
export class EditPurchases extends BaseComponent {
  id = input.required<number>();
}
