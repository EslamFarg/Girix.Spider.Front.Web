import { BaseComponent, IPaginationInfo, SectionWrapper } from '@/components';
import { CustomerSearchEnum, CustomerService } from '@/features/customers/services/customer-service';
import { ICustomerSearchRow } from '@/features/customers/services/customer-types';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PaginatorState, Paginator } from 'primeng/paginator';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputErrorMessageHandler } from '@/yn-ng';
import { Select } from 'primeng/select';
import { Debounce } from '@/directives/debounce';
import { InputText } from 'primeng/inputtext';
import { CollectionsService, OpenCollectionDialogOptsDeliveryType } from '../../services/collections-service';

@Component({
  selector: 'app-company-deliveries',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Paginator,
    TranslatePipe,
    InputGroupAddon,
    InputErrorMessageHandler,
    Select,
    Debounce,
    SectionWrapper,
    InputText,
  ],
  templateUrl: './company-deliveries.html',
  styleUrl: './company-deliveries.css',
})
export class CompanyDeliveries extends BaseComponent {
    OpenCollectionDialogOptsDeliveryType = OpenCollectionDialogOptsDeliveryType;
  
  initialFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<CustomerSearchEnum>(CustomerSearchEnum.Name, [Validators.required]),
  };
  fg = this.fb.group(this.initialFormValue);

  filterOptions = [
    { label: 'الاسم', value: CustomerSearchEnum.Name },
    { label: 'رقم الهاتف', value: CustomerSearchEnum.PhoneNumber },
  ];

  constructor() {
    super();

    this.searchCustomers(1);
  }
  customersService = inject(CustomerService);

  customers = signal<ICustomerSearchRow[]>([]);

  customersPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalRowsCount: 0,
    totalPagesCount: 0,
  };

  searchCustomers(pageIndex: number) {
    const fgRawValue = this.fg.getRawValue();

    let searchFilters: any[] = [
      {
        values: [fgRawValue.searchTerm],
        column: fgRawValue.searchEnum,
      },
      {
        values: ['true'],
        column: CustomerSearchEnum.IsCompany,
      },
    ];

    this.customersService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 10,
        },
        searchFilters: searchFilters,
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
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  collectionsService = inject(CollectionsService);
  isCollectionDialogVisible = this.collectionsService.isCollectionInvoiceDialogVisible;
  openCollectionDialog = this.collectionsService.openCollectionDialog;

  isInvoiceTypeChangeDialogVisible = false;

  openInvoiceTypeChangeDialog() {
    this.isInvoiceTypeChangeDialogVisible = true;
  }

  closeInvoiceTypeChangeDialog() {
    this.isInvoiceTypeChangeDialogVisible = false;
  }
}
