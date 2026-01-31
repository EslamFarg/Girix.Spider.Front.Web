import { Component } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { CustomersForm } from '../../components/customers-form/customers-form';
import { DeliveriesNav } from '@/features/deliveries/components/deliveries-nav/deliveries-nav';
import { DeliveryManForm } from '@/features/deliveries/components/delivery-man-form/delivery-man-form';
import { BaseComponent } from '@/components/base-component/base-component';
import { ICustomerDtoResponse } from '../../services/customer-service';
import { onlyNumbersAllowed, noSymbolsAllowed } from '@/yn-ng/utils/text-validators';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-customer',
  imports: [SectionWrapper, CustomersForm, DeliveriesNav, DeliveryManForm],
  templateUrl: './edit-customer.html',
  styleUrl: './edit-customer.css',
})
export class EditCustomer extends BaseComponent {
  currentItem: ICustomerDtoResponse | null = null;
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
  fg = this.fb.group(this.initialFormValue);
}
