import { Component } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { CustomerForm } from '../../components/customer-form/customer-form';
import { DeliveriesNav } from '@/features/deliveries/components/deliveries-nav/deliveries-nav';
import { DeliveryManForm } from '@/features/deliveries/components/delivery-man-form/delivery-man-form';
import { BaseComponent } from '@/components/base-component/base-component';
import { Validators } from '@angular/forms';
import { noSymbolsAllowed, onlyNumbersAllowed } from '@/yn-ng/utils/text-validators';

@Component({
  selector: 'app-add-customer',
  imports: [SectionWrapper, CustomerForm, DeliveriesNav, DeliveryManForm],
  templateUrl: './add-customer.html',
  styleUrl: './add-customer.css',
})
export class AddCustomer extends BaseComponent {
  initialFormValue = {
    id: this.fb.control<number>(0, [Validators.required]),
    phoneNumber: this.fb.control<string>('', [Validators.required, onlyNumbersAllowed]),
    secondaryMobileNumber: this.fb.control<string>('', [Validators.required, onlyNumbersAllowed]),
    district: this.fb.control<string>('', [Validators.required, noSymbolsAllowed]),
    city: this.fb.control<string>('', [Validators.required, noSymbolsAllowed]),
    street: this.fb.control<string>('', [Validators.required, noSymbolsAllowed]),
    buildingNumber: this.fb.control<string>('', [Validators.required, onlyNumbersAllowed]),
    apartment: this.fb.control<string>('', [Validators.required]),
    postalCode: this.fb.control<string>('', [Validators.required, onlyNumbersAllowed]),
    landmark: this.fb.control<string>('', [Validators.required]),
    nameAr: this.fb.control<string>('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
      noSymbolsAllowed,
    ]),
    nameEn: this.fb.control<string>('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
      noSymbolsAllowed,
    ]),
    isCompany: this.fb.control<boolean>(false, []),
  };
}
