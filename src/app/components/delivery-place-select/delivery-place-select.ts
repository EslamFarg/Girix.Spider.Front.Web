import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomerSearchEnum, CustomerService } from '@/features/customers/services/customer-service';
import { ICustomerSearchRow } from '@/features/customers/services/customer-types';
import {
    DeliverySearchEnum,
    DeliveryService,
    IDeliverySearchRow,
} from '@/features/deliveries/services/delivery-service';
import { DialogType } from '@/features/dialogs/enums';
import { OrderLocationType } from '@/features/orders';
import { BaseComponent } from '../base-component/base-component';
import { SelectorPopupShell } from '../selector-popup-shell/selector-popup-shell';
import { ButtonDirective } from 'primeng/button';
import { MaintenanceService } from '@/features/settings/services/maintenance-service';

export type DeliveryPlaceSelection = {
    orderType: OrderLocationType.PersonDelivery | OrderLocationType.CompanyDelivery;
    delivery: IDeliverySearchRow | ICustomerSearchRow;
};

@Component({
    selector: 'app-delivery-place-select',
    imports: [SelectorPopupShell, ButtonDirective],
    templateUrl: './delivery-place-select.html',
    styleUrl: './delivery-place-select.css',
})
export class DeliveryPlaceSelect extends BaseComponent {
    OrderLocationType = OrderLocationType;

    deliveryService = inject(DeliveryService);
    customersService = inject(CustomerService);

    isCompanyDelivery = signal(false);
    searchTerm = signal('');

    deliveries = signal<IDeliverySearchRow[]>([]);
    companyDeliveries = signal<ICustomerSearchRow[]>([]);

    tempSelection = linkedSignal<DeliveryPlaceSelection | null>(() => null);

    paginationInfo = {
        pageIndex: 1,
        totalPagesCount: 1,
        totalRowsCount: 0,
    };

    title = computed(() => (this.isCompanyDelivery() ? 'اختر الشركة' : 'اختر الدليفري'));

    searchPlaceholder = computed(() =>
        this.isCompanyDelivery() ? 'ابحث باسم الشركة' : 'ابحث باسم الدليفري',
    );

    filteredDeliveries = computed(() => {
        const term = this.searchTerm().trim().toLowerCase();
        const rows = this.deliveries();
        if (!term) return rows;
        return rows.filter((item) => item.name.toLowerCase().includes(term));
    });

    filteredCompanies = computed(() => {
        const term = this.searchTerm().trim().toLowerCase();
        const rows = this.companyDeliveries();
        if (!term) return rows;
        return rows.filter((item) => item.name.toLowerCase().includes(term));
    });

    displayCount = computed(() =>
        this.isCompanyDelivery() ? this.filteredCompanies().length : this.filteredDeliveries().length,
    );

    confirmDisabled = computed(() => !this.tempSelection());

    constructor() {
        super();
        this.loadItems(1);
        inject(MaintenanceService)
            .deliveryReset$
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.onDeliveryReset());
    }

    private onDeliveryReset() {
        this.searchTerm.set('');
        this.tempSelection.set(null);
        this.paginationInfo = { pageIndex: 1, totalPagesCount: 1, totalRowsCount: 0 };
        this.loadItems(1);
    }

    setDeliveryType(isCompany: boolean) {
        if (this.isCompanyDelivery() === isCompany) return;
        this.isCompanyDelivery.set(isCompany);
        this.searchTerm.set('');
        this.tempSelection.set(null);
        this.paginationInfo = { pageIndex: 1, totalPagesCount: 1, totalRowsCount: 0 };
        this.loadItems(1);
    }

    loadItems(pageIndex: number) {
        if (this.isCompanyDelivery()) {
            this.customersService
                .search({
                    paginationInfo: { pageIndex, pageSize: 40 },
                    searchFilters: [{ column: CustomerSearchEnum.IsCompany, values: ['true'] }],
                    fromDate: null,
                })
                .subscribe({
                    next: (res) => {
                        if (pageIndex === 1) {
                            this.companyDeliveries.set(res.value.rows);
                        } else if (res.value.rows.length > 0) {
                            this.companyDeliveries.update((prev) => prev.concat(res.value.rows));
                        }
                        this.paginationInfo = {
                            pageIndex,
                            totalPagesCount: res.value.paginationInfo.totalPagesCount,
                            totalRowsCount: res.value.paginationInfo.totalRowsCount,
                        };
                    },
                });
        } else {
            this.deliveryService
                .search({
                    paginationInfo: { pageIndex, pageSize: 40 },
                    searchFilters: [{ column: DeliverySearchEnum.Name, values: [''] }],
                    fromDate: null,
                })
                .subscribe({
                    next: (res) => {
                        if (pageIndex === 1) {
                            this.deliveries.set(res.value.rows);
                        } else if (res.value.rows.length > 0) {
                            this.deliveries.update((prev) => prev.concat(res.value.rows));
                        }
                        this.paginationInfo = {
                            pageIndex,
                            totalPagesCount: res.value.paginationInfo.totalPagesCount,
                            totalRowsCount: res.value.paginationInfo.totalRowsCount,
                        };
                    },
                });
        }
    }

    onGridScroll(event: Event) {
        const scroller = event.target as HTMLElement;
        if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1) {
            if (this.paginationInfo.pageIndex < this.paginationInfo.totalPagesCount) {
                this.loadItems(this.paginationInfo.pageIndex + 1);
            }
        }
    }

    onSelectDelivery(item: IDeliverySearchRow) {
        this.tempSelection.set({ orderType: OrderLocationType.PersonDelivery, delivery: item });
    }

    onSelectCompany(item: ICustomerSearchRow) {
        this.tempSelection.set({ orderType: OrderLocationType.CompanyDelivery, delivery: item });
    }

    isDeliveryActive(item: IDeliverySearchRow) {
        const selected = this.tempSelection();
        return (
            selected?.orderType === OrderLocationType.PersonDelivery && selected.delivery.id === item.id
        );
    }

    isCompanyActive(item: ICustomerSearchRow) {
        const selected = this.tempSelection();
        return (
            selected?.orderType === OrderLocationType.CompanyDelivery && selected.delivery.id === item.id
        );
    }

    cancelDialog() {
        this.dialogService.close({ type: DialogType.DeliveryPlaceSelect, data: null });
    }

    closeDialog() {
        const selected = this.tempSelection();
        if (!selected) return;
        this.dialogService.close({ type: DialogType.DeliveryPlaceSelect, data: selected });
    }
}
