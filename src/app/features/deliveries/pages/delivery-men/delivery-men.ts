import { Component, inject, OnDestroy, signal } from '@angular/core';
import { BaseComponent, FormMode } from '@/components/base-component/base-component';
import { DeliverySearchEnum, DeliveryService, IDeliverySearchRow } from '../../services/delivery-service';
import { TranslatePipe } from '@ngx-translate/core';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { TooltipModule } from 'primeng/tooltip';
import { MaintenanceService } from '@/features/settings/services/maintenance-service';
import { DeliveryManForm } from '../../components/delivery-man-form/delivery-man-form';
import { API_GRID_PAGE_SIZE } from '@/core/constants/pagination.constants';

@Component({
  selector: 'app-delivery-men',
  imports: [
    TranslatePipe,
    LoadingDisabledDirective,
    TooltipModule,
    DeliveryManForm,
  ],
  templateUrl: './delivery-men.html',
  styleUrl: './delivery-men.css',
})
export class DeliveryMen extends BaseComponent implements OnDestroy {
  deliveryService = inject(DeliveryService);
  maintenanceService = inject(MaintenanceService);
  deliveryResetSub?: ReturnType<typeof this.maintenanceService.deliveryReset$.subscribe>;

  deliveryMen = signal<IDeliverySearchRow[]>([]);
  selectedDeliveryId = signal<number>(0);

  constructor() {
    super();

    this.loadDeliveryMen();
    this.deliveryResetSub = this.maintenanceService.deliveryReset$.subscribe(() => {
      this.selectedDeliveryId.set(0);
      this.loadDeliveryMen();
    });
  }

  override ngOnDestroy() {
    this.deliveryResetSub?.unsubscribe();
    super.ngOnDestroy();
  }

  get embeddedFormMode(): FormMode {
    return this.selectedDeliveryId() > 0 ? FormMode.Update : FormMode.Create;
  }

  onRowSelect(item: IDeliverySearchRow) {
    this.selectedDeliveryId.set(item.id);
  }

  onDeliverySaved() {
    this.selectedDeliveryId.set(0);
    this.loadDeliveryMen();
  }

  onDeliveryReset() {
    this.selectedDeliveryId.set(0);
  }

  loadDeliveryMen() {
    this.deliveryService
      .search({
        paginationInfo: {
          pageIndex: 1,
          pageSize: API_GRID_PAGE_SIZE,
        },
        searchFilters: [
          {
            column: DeliverySearchEnum.Name,
            values: [''],
          },
        ],
        fromDate: null,
      })
      .subscribe({
        next: (res) => {
          this.deliveryMen.set(res.value.rows);
        },
      });
  }

  deleteDelivery(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف الديلفرى',
      header: 'حذف الديلفرى',
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
            if (this.selectedDeliveryId() === id) this.selectedDeliveryId.set(0);
            this.loadDeliveryMen();
          },
        });
      },
    });
  }
}
