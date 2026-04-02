import { Component } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { PurchaseReturnForm } from '../../components/purchase-return-form/purchase-return-form';

@Component({
  selector: 'app-add-purchase-return',
  imports: [SectionWrapper, PurchaseReturnForm],
  templateUrl: './add-purchase-return.html',
  styleUrl: './add-purchase-return.css',
})
export class AddPurchaseReturn {}
