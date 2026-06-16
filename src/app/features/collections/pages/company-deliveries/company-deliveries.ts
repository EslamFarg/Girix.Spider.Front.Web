import { BaseComponent, IPaginationInfo, SectionWrapper } from '@/components';
import { CustomerSearchEnum, CustomerService } from '@/features/customers/services/customer-service';
import { ICustomerSearchRow } from '@/features/customers/services/customer-types';
import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { PaginatorState, Paginator } from 'primeng/paginator';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputErrorMessageHandler } from '@/yn-ng';
import { Debounce } from '@/directives/debounce';
import { InputText } from 'primeng/inputtext';
import { CollectionsService } from '../../services/collections-service';
import { OrderLocationType } from '@/features/orders';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";
import { Menu } from "primeng/menu";
import { Listbox } from "primeng/listbox";
import { ButtonDirective } from "primeng/button";
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-company-deliveries',
  imports: [
    ReactiveFormsModule,
    Paginator,
    TranslatePipe,
    InputGroupAddon,
    InputErrorMessageHandler,
    Debounce,
    SectionWrapper,
    InputText,
    LoadingDisabledDirective,
    Menu,
    Listbox,
    ButtonDirective,
    TooltipModule
],
  templateUrl: './company-deliveries.html',
  styleUrl: './company-deliveries.css',
})
export class CompanyDeliveries extends BaseComponent implements OnInit, OnDestroy {
    OrderLocationType = OrderLocationType;
  
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

    effect(() => {
      const collectedIds = this.collectionsService.collectedOrderIds();
      if (collectedIds.length > 0) {
        this.customers.update((rows) =>
          rows.map((c) => (c.id === this.collectionsService.currentDeliveryId() ? { ...c, orderNumbers: Math.max(0, c.orderNumbers - collectedIds.length) } : c)),
        );
      }
    });
  }

  collectionSub?: ReturnType<typeof this.collectionsService.collectionCompleted$.subscribe>;

  ngOnInit() {
    this.collectionSub = this.collectionsService.collectionCompleted$.subscribe(() => {
      this.searchCustomers(1);
    });
  }

  override ngOnDestroy() {
    this.collectionSub?.unsubscribe();
    super.ngOnDestroy();
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
          pageSize: 0,
        },
        searchFilters: searchFilters,
        fromDate: null,
        searchEndpoint:"SearchCompany"
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
