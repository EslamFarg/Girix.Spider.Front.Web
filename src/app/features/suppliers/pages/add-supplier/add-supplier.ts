import { Component } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { SupplierForm } from '../../components/supplier-form/supplier-form';
import { DeliveriesNav } from '@/features/deliveries/components/deliveries-nav/deliveries-nav';
import { DeliveryManForm } from '@/features/deliveries/components/delivery-man-form/delivery-man-form';
import { BaseComponent } from '@/components/base-component/base-component';
import { Validators } from '@angular/forms';
import { noSymbolsAllowed, onlyNumbersAllowed } from '@/yn-ng/utils/text-validators';

@Component({
  selector: 'app-add-supplier',
  imports: [SectionWrapper, SupplierForm, DeliveriesNav, DeliveryManForm],
  templateUrl: './add-supplier.html',
  styleUrl: './add-supplier.css',
})
export class AddSupplier extends BaseComponent {

}
