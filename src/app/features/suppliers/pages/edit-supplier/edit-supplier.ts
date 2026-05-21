import { Component, input } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { SupplierForm } from '../../components/supplier-form/supplier-form';
import { DeliveriesNav } from '@/features/deliveries/components/deliveries-nav/deliveries-nav';
import { DeliveryManForm } from '@/features/deliveries/components/delivery-man-form/delivery-man-form';
import { BaseComponent } from '@/components/base-component/base-component';
import { onlyNumbersAllowed, noSymbolsAllowed } from '@/yn-ng/utils/text-validators';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-supplier',
  imports: [SectionWrapper, SupplierForm, DeliveriesNav, DeliveryManForm],
  templateUrl: './edit-supplier.html',
  styleUrl: './edit-supplier.css',
})
export class EditSupplier extends BaseComponent {
  id = input.required<number>();
}
