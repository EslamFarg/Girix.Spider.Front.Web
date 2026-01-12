import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { PurchasesNav } from '@/features/storage/components/purchases-nav/purchases-nav';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { CustomersNav } from '../../components/customers-nav/customers-nav';
import { InputText } from 'primeng/inputtext';
import {
  CustomerSearchEnum,
  CustomerService,
  ICustomerDtoResponse,
  ICustomerRowResponse,
} from '../../services/customer-service';
import { noSymbolsAllowed, onlyNumbersAllowed } from '@/lib/text-validators';
import { omitKeys } from '@/lib/helpers';
import { RouterLink } from '@angular/router';
import { Debounce } from '@/directives/debounce';

@Component({
  selector: 'app-customers',
  imports: [
    Select,
    InputErrorMessageHandler,
    SectionWrapper,
    InputGroupAddon,
    ReactiveFormsModule,
    Paginator,
    CustomersNav,
    InputText,
    RouterLink,
    Debounce,
  ],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers extends BaseComponent<ICustomerRowResponse> {
  initialFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<CustomerSearchEnum>(CustomerSearchEnum.Name, [Validators.required]),
  };
  fg = this.fb.group(this.initialFormValue);

  periodOptions = [
    // { label: 'اليوم', value: CustomerSearchEnum.Id },
    { label: 'الاسم', value: CustomerSearchEnum.Name },
    { label: 'رقم الهاتف', value: CustomerSearchEnum.PhoneNumber },
    { label: 'شركة', value: CustomerSearchEnum.IsCompany },
  ];

  customersService = inject(CustomerService);

  constructor() {
    super();

    this.resetState();
  }

  resetState = () => {
    this.resetForm();
 
    //get page 1 of 10 orders
    this.customersService.search( { pageIndex: 1 }, this.fg.getRawValue().searchEnum).subscribe({
      next: (res) => {
        this.first = 0;
        this.items.set(res.value.rows);
      },
    });
  };

  onSubmit() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    const fgRawValue = this.fg.getRawValue();
    let searchValues: any[] = [fgRawValue.searchTerm];
    if (fgRawValue.searchEnum === CustomerSearchEnum.IsCompany) searchValues.push('true');

    this.customersService.search({ pageIndex: 1 }, fgRawValue.searchEnum, searchValues).subscribe({
      next: (res) => {
        this.items.set(res.value.rows);
        this.first = 0;
      },
    });
  }

  resetForm = () => (this.fg = this.fb.group(this.initialFormValue));

  first = 0;
  rows = 10;

  onPageChange(event: PaginatorState) {
    this.customersService.search({ pageIndex: event.page! + 1 }, this.fg.getRawValue().searchEnum).subscribe({
      next: (res) => {
        this.items.set(res.value.rows);
      },
    });
  }

  deleteCustomer(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف العميل',
      header: 'حذف العميل',
      icon: 'pi pi-info-circle',
      rejectLabel: 'الغاء',
      rejectButtonProps: {
        label: 'الغاء',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'حذف',
        severity: 'danger',
      },

      accept: () => {
        this.customersService.delete(id).subscribe({
          next: () => {
            this.resetState();
          },
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' });
      },
    });
  }
}
