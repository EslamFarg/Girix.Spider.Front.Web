import { Component, inject, signal } from '@angular/core';
import { DeliveriesNav } from '../../components/deliveries-nav/deliveries-nav';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { InputText } from 'primeng/inputtext';
import { DeliverySearchEnum, DeliveryService, IDeliveryRowResponse } from '../../services/delivery-service';
import { MenuItem } from 'primeng/api';
import { Debounce } from '@/directives/debounce';
import { Menu } from 'primeng/menu';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-delivery-men',
  imports: [
    DeliveriesNav,
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    Select,
    Paginator,
    ReactiveFormsModule,
    InputText,
    Debounce,
    Menu,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './delivery-men.html',
  styleUrl: './delivery-men.css',
})
export class DeliveryMen extends BaseComponent {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<DeliverySearchEnum>(DeliverySearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };
  searchFg = this.fb.group(this.initialSearchFormValue);

  deliveryService = inject(DeliveryService);
  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'الاسم',
      command: (event) => this.searchFg.patchValue({ searchEnum: DeliverySearchEnum.Name }),
    },
    {
      label: 'رقم الهاتف',
      command: (event) => this.searchFg.patchValue({ searchEnum: DeliverySearchEnum.PhoneNumber }),
    },
  ]);

  constructor() {
    super();

    this.searchDeliverys(1);
  }

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousUTCDate(1) },
    { label: 'اخر اسبوع', value: this.getPreviousUTCDate(7) },
    { label: 'اخر شهر', value: this.getPreviousUTCDate(30) },
    { label: 'اخر سنة', value: this.getPreviousUTCDate(365) },
  ];

  deliveryMen = signal<IDeliveryRowResponse[]>([]);

  deliveryMenPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalRowsCount: 0,
    totalPagesCount: 0,
  };

  searchDeliverys(pageIndex: number) {
    this.deliveryService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 10,
        },
        searchFilters: [
          {
            column: this.searchFg.getRawValue().searchEnum,
            values: [this.searchFg.getRawValue().searchTerm],
          },
        ],
        fromDate: this.searchFg.getRawValue().fromDate,
      })
      .subscribe({
        next: (res) => {
          this.deliveryMen.set(res.value.rows);
          this.deliveryMenPaginationInfo = {
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  onSubmit = () => this.searchFg.valid && this.searchDeliverys(1);

  onPageChange = (event: PaginatorState) => this.searchDeliverys(event.page! + 1);

  deleteDelivery(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف المنتج',
      header: 'حذف المنتج',
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
        this.deliveryService.delete(id).subscribe({
          next: () => {
            this.searchDeliverys(1);
          },
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' });
      },
    });
  }
}
