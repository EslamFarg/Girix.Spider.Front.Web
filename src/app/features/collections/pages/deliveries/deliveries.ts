import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { CollectionsService } from '../../services/collections-service';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import {
  DeliverySearchEnum,
  DeliveryService,
  IDeliverySearchRow,
} from '@/features/deliveries/services/delivery-service';
import { MenuItem } from 'primeng/api';
import { Debounce } from '@/directives/debounce';
import { Menu } from 'primeng/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { OrderLocationType } from '@/features/orders';

@Component({
  selector: 'app-deliveries',
  imports: [
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    Paginator,
    ReactiveFormsModule,
    InputText,
    Select,
    Dialog,
    Button,
    ReactiveFormsModule,
    Debounce,
    Menu,
    TranslatePipe,
  ],
  templateUrl: './deliveries.html',
  styleUrl: './deliveries.css',
})
export class Deliveries extends BaseComponent {
  OrderLocationType = OrderLocationType;
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

  companyFilter = [
    { label: 'افراد', value: false },
    { label: 'شركات', value: true },
  ];

  

  deliveryMen = signal<IDeliverySearchRow[]>([]);

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
