import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { Carousel } from 'primeng/carousel';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { BaseComponent, FormMode } from '@/components/base-component/base-component';
import { TranslatePipe } from '@ngx-translate/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { noSymbolsAllowed } from '@/yn-ng/utils/text-validators';
import { ICustomerFgControls } from './types';
import { CustomerService } from '../../services/customer-service';
import { ICustomerReadResponse } from '../../services/customer-types';

@Component({
  selector: 'app-customers-form',
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
  ],
  templateUrl: './customers-form.html',
  styleUrl: './customers-form.css',
})
export class CustomersForm extends BaseComponent implements OnInit {
  //
  //
  //inputs
  //

  formMode = input.required<FormMode>();
  id = input.required<number | null>();

  //
  //
  //state
  //

  initialCustomerFgValue: ICustomerFgControls = {
    //todo: add controlls

    //update only prop
    id: this.fb.control(null, []),
  };

  userFg = this.fb.group(this.initialCustomerFgValue);

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
        });
        break;
    }
  }

  onSubmitForm() {
    // this.userFg.patchValue({
    //   nameEn: this.userFg.value.nameAr?.trim(),
    // });

    // debugger;
    if (this.userFg.invalid) {
      this.userFg.markAllAsTouched();
      return;
    }

    // switch (this.formMode()) {
    //   case FormMode.Create:
    //     this.CustomerService.create(dto).subscribe();
    //     break;
    //   case FormMode.Update:

    //     this.CustomerService.put(dto).subscribe();
    //     break;
    // }
  }
}
