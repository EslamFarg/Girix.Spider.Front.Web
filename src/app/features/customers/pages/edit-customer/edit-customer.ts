import { Component, input } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { CustomersForm } from '../../components/customers-form/customers-form';
import { DeliveriesNav } from '@/features/deliveries/components/deliveries-nav/deliveries-nav';
import { DeliveryManForm } from '@/features/deliveries/components/delivery-man-form/delivery-man-form';
import { BaseComponent } from '@/components/base-component/base-component';
import { onlyNumbersAllowed, noSymbolsAllowed } from '@/yn-ng/utils/text-validators';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-customer',
  imports: [SectionWrapper, CustomersForm, DeliveriesNav, DeliveryManForm],
  templateUrl: './edit-customer.html',
  styleUrl: './edit-customer.css',
})
export class EditCustomer extends BaseComponent {
  id = input.required<number>();
}
