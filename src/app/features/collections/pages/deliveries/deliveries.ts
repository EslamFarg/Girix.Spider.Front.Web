import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { CollectionsService } from '../../services/collections-service';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { InputText } from 'primeng/inputtext';
import {
  DeliverySearchEnum,
  DeliveryService,
  IDeliverySearchRow,
} from '@/features/deliveries/services/delivery-service';
import { Debounce } from '@/directives/debounce';
import { Menu } from 'primeng/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { OrderLocationType } from '@/features/orders';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";
import { Listbox } from "primeng/listbox";
import { TooltipModule } from 'primeng/tooltip';
import { MaintenanceService } from '@/features/settings/services/maintenance-service';

@Component({
  selector: 'app-deliveries',
  imports: [
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    Paginator,
    ReactiveFormsModule,
    InputText,
    ReactiveFormsModule,
    Debounce,
    Menu,
    TranslatePipe,
    LoadingDisabledDirective,
    Listbox,
    TooltipModule
],
  templateUrl: './deliveries.html',
  styleUrl: './deliveries.css',
})
export class Deliveries extends BaseComponent implements OnInit, OnDestroy {
  OrderLocationType = OrderLocationType;
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<DeliverySearchEnum>(DeliverySearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };
  searchFg = this.fb.group(this.initialSearchFormValue);

  deliveryService = inject(DeliveryService);
  filterMenuItems = signal([
    {
      label: 'الاسم',
      value: DeliverySearchEnum.Name,
    },
    {
      label: 'رقم الهاتف',
      value: DeliverySearchEnum.PhoneNumber,
    },
  ]);

  constructor() {
    super();

    this.searchDeliverys(1);

    effect(() => {
      const collectedIds = this.collectionsService.collectedOrderIds();
      if (collectedIds.length > 0) {
        this.deliveryMen.update((rows) =>
          rows.map((d) => (d.id === this.collectionsService.currentDeliveryId() ? { ...d, orderNumber: Math.max(0, d.orderNumber - collectedIds.length) } : d)),
        );
      }
    });
  }

  collectionSub?: ReturnType<typeof this.collectionsService.collectionCompleted$.subscribe>;
  deliveryResetSub?: ReturnType<typeof this.maintenanceService.deliveryReset$.subscribe>;
  maintenanceService = inject(MaintenanceService);

  ngOnInit() {
    this.collectionSub = this.collectionsService.collectionCompleted$.subscribe(() => {
      this.searchDeliverys(1);
    });
    this.deliveryResetSub = this.maintenanceService.deliveryReset$.subscribe(() => {
      this.searchFg.reset(this.initialSearchFormValue);
      this.isInvoiceTypeChangeDialogVisible = false;
      this.searchDeliverys(1);
    });
  }

  override ngOnDestroy() {
    this.collectionSub?.unsubscribe();
    this.deliveryResetSub?.unsubscribe();
    super.ngOnDestroy();
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
          pageSize: 0,
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
