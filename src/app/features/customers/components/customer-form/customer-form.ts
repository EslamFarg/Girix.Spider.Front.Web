import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { Carousel } from 'primeng/carousel';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { BaseComponent, FormMode } from '@/components/base-component/base-component';
import { TranslatePipe } from '@ngx-translate/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { noSymbolsAllowed, onlyNumbersAllowed } from '@/yn-ng/utils/text-validators';
import { ICustomerFgControls } from './types';
import { CustomerService } from '../../services/customer-service';
import { ICustomerReadResponse } from '../../services/customer-types';
import { RouterLink } from '@angular/router';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { AllowNumbers } from '@/directives/allow-numbers';

@Component({
  selector: 'app-customer-form',
  imports: [
    Button,
    Carousel,
    InputErrorMessageHandler,
    Select,
    InputText,
    Textarea,
    TranslatePipe,
    ButtonDirective,
    ReactiveFormsModule,
    RouterLink,
    LoadingDisabledDirective,
    AllowNumbers,
  ],
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.css',
})
export class CustomerForm extends BaseComponent implements OnInit {
  //
  //
  //inputs
  //

  formMode = computed(() => {
    if (this.currentCustomer()) return FormMode.Update;
    return this.initialFormMode();
  });
  id = input.required<number | null>();

  //
  //
  //state
  //

  initialCustomerFgValue: ICustomerFgControls = {
    id: this.fb.control(null, []),
    nameAr: this.fb.control(null, [Validators.required, noSymbolsAllowed]),
    nameEn: this.fb.control(null, [Validators.required, noSymbolsAllowed]),
    phoneNumber: this.fb.control(null, [
      Validators.required,
      onlyNumbersAllowed,
      Validators.minLength(6),
      Validators.maxLength(16),
    ]),
    secondaryMobileNumber: this.fb.control(null, [Validators.required, onlyNumbersAllowed]),
    city: this.fb.control(null, [Validators.required]),
    district: this.fb.control(null, [Validators.required]),
    street: this.fb.control(null, [Validators.required]),
    buildingNumber: this.fb.control(null, [Validators.required, onlyNumbersAllowed]),
    apartment: this.fb.control(null, [Validators.required, onlyNumbersAllowed]),
    landmark: this.fb.control(null, [Validators.required]),
    postalCode: this.fb.control(null, [Validators.required, onlyNumbersAllowed]),
    commercialRegister: this.fb.control(null, [
      Validators.required,
      onlyNumbersAllowed,
      Validators.minLength(10),
      Validators.maxLength(10),
    ]),
    //ends and starts with  3
    taxNumber: this.fb.control(null, [
      Validators.required,
      Validators.minLength(15),
      Validators.maxLength(15),
      onlyNumbersAllowed,
      Validators.pattern(/^3.*3$/),
    ]),
    numberOfFloor: this.fb.control(null, [Validators.required, onlyNumbersAllowed]),
    isCompany: this.fb.control(true, [Validators.required]),
    consumeInventory: this.fb.control(true, [Validators.required]),
  };

  customerFg = this.fb.group(this.initialCustomerFgValue);

  //services
  customerService = inject(CustomerService);
  currentCustomer = signal<ICustomerReadResponse | null>(null);

  /**
   *
   */

  //
  //
  //
  //
  ngOnInit(): void {
    switch (this.formMode()) {
      case FormMode.Create:
        break;
      case FormMode.Update:
        //fetch
        this.customerService.getById(this.id()!).subscribe((Customer) => {
          this.currentCustomer.set(Customer);
          //-> bind data
          console.log('customer', Customer);
          this.customerFg.patchValue({ ...Customer, nameAr: Customer.name, nameEn: Customer.name });
        });
        break;
    }
  }

  onSubmitForm() {
    this.customerFg.patchValue({
      nameEn: this.customerFg.value.nameAr?.trim(),
      landmark: this.customerFg.value.numberOfFloor,
    });

    console.log(this.customerFg.value);
    if (this.customerFg.invalid) {
      this.customerFg.markAllAsTouched();
      return;
    }

    // let dto={}

    switch (this.formMode()) {
      case FormMode.Create:
        this.customerService.create(this.customerFg.value).subscribe({
          next: (res) => {
            this.router.navigate(['/customers']);
          },
        });
        break;
      case FormMode.Update:
        this.customerService.put({ ...this.customerFg.value, id: Number(this.id()) }).subscribe({
          next: (res) => {
            this.router.navigate(['/customers']);
          },
        });
        break;
    }
  }
}
