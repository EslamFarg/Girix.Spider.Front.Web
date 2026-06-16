import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { InputText } from 'primeng/inputtext';
import { SupplierSearchEnum, SupplierService } from '../../services/supplier-service';
import { RouterLink } from '@angular/router';
import { Debounce } from '@/directives/debounce';
import { ISupplierSearchRow } from '../../services/supplier-types';
import { TranslatePipe } from '@ngx-translate/core';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-suppliers',
  imports: [
    Select,
    InputErrorMessageHandler,
    InputGroupAddon,
    ReactiveFormsModule,
    Paginator,
    InputText,
    RouterLink,
    Debounce,
    TranslatePipe,
    LoadingDisabledDirective,
    TooltipModule
  ],
  templateUrl: './suppliers.html',
  styleUrl: './suppliers.css',
})
export class Suppliers extends BaseComponent {
  initialFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<SupplierSearchEnum>(SupplierSearchEnum.Name, [Validators.required]),
  };
  fg = this.fb.group(this.initialFormValue);

  periodOptions = [
    // { label: 'اليوم', value: SupplierSearchEnum.Id },
    { label: 'الاسم', value: SupplierSearchEnum.Name },
    { label: 'رقم الهاتف', value: SupplierSearchEnum.PhoneNumber },
  ];

  constructor() {
    super();

    this.searchSuppliers(1);
  }
  suppliersService = inject(SupplierService);

  suppliers = signal<ISupplierSearchRow[]>([]);

  suppliersPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalRowsCount: 0,
    totalPagesCount: 0,
  };

  searchSuppliers(pageIndex: number) {
    const fgRawValue = this.fg.getRawValue();

    let searchFilters: any[] = [
      {
        values: [fgRawValue.searchTerm],
        column: SupplierSearchEnum.Name,
      },
    ];

    this.suppliersService
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
          this.suppliers.set(res.value.rows);
          this.suppliersPaginationInfo = {
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  onSearchSubmit() {
    if (this.fg.invalid) return this.fg.markAllAsTouched();

    this.searchSuppliers(1);
  }

  resetForm = () => (this.fg = this.fb.group(this.initialFormValue));

  onPageChange = (event: PaginatorState) => this.searchSuppliers(event.page! + 1);

  deleteSupplier(id: number, event: Event) {
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
        this.suppliersService.delete(id).subscribe({
          next: () => {
            this.searchSuppliers(1);
          },
        });
      },
      
    });
  }
}
