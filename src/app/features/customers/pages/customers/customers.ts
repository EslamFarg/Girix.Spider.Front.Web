import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { InputText } from 'primeng/inputtext';
import {
  CustomerSearchEnum,
  CustomerService,
} from '../../services/customer-service';
import { noSymbolsAllowed, onlyNumbersAllowed } from '@/yn-ng/utils/text-validators';
import { omitKeys } from '@/yn-ng/utils/helpers';
import { RouterLink } from '@angular/router';
import { Debounce } from '@/directives/debounce';
import { ICustomerSearchRow } from '../../services/customer-types';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-customers',
  imports: [
    Select,
    InputErrorMessageHandler,
    SectionWrapper,
    InputGroupAddon,
    ReactiveFormsModule,
    Paginator,
    InputText,
    RouterLink,
    Debounce,
    TranslatePipe
  ],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers extends BaseComponent {
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

    this.searchCustomers(1);
  }

  customers = signal<ICustomerSearchRow[]>([]);

  customersPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalRowsCount: 0,
    totalPagesCount: 0,
  };

  searchCustomers(pageIndex: number) {
    const fgRawValue = this.fg.getRawValue();

    let searchValues: any[] = [fgRawValue.searchTerm];
    if (fgRawValue.searchEnum === CustomerSearchEnum.IsCompany) searchValues.push('true');

    this.customersService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 10,
        },
        searchFilters: [
          {
            column: this.fg.getRawValue().searchEnum,
            values: searchValues,
          },
        ],
        fromDate: null,
      })
      .subscribe({
        next: (res) => {
          this.customers.set(res.value.rows);
          this.customersPaginationInfo = {
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  onSearchSubmit() {
    if (this.fg.invalid) return this.fg.markAllAsTouched();

    this.searchCustomers(1);
  }

  resetForm = () => (this.fg = this.fb.group(this.initialFormValue));

  onPageChange = (event: PaginatorState) => this.searchCustomers(event.page! + 1);

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
            this.searchCustomers(1);
          },
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' });
      },
    });
  }
}
