import { Component, computed, effect, inject, linkedSignal, model, signal, untracked } from '@angular/core';
import { Select } from 'primeng/select';
import { HutCard } from '../hut-card/hut-card';
import { Debounce } from '@/directives/debounce';
import { OrderLocalType, OrderService } from '@/features/orders';
import { RoomCard } from '../room-card/room-card';
import { TableCard } from '../table-card/table-card';
import { HutService, IHutSearchRow } from '@/features/restaurant/services/hut-service';
import { IRoomSearchRow, RoomService } from '@/features/restaurant/services/room-service';
import { ITableSearchRow, TableService } from '@/features/restaurant/services/table-service';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '../base-component/base-component';
import { DialogType } from '@/features/dialogs/enums';
import { ButtonDirective } from 'primeng/button';

type IChosenPlace = (IHutSearchRow | IRoomSearchRow | ITableSearchRow) & { type: OrderLocalType };
export type ChosenLocalPlace = IChosenPlace & {
    reservationMinutes: number | null;
};

@Component({
    selector: 'app-local-place-select',
    imports: [Select, HutCard, Debounce, RoomCard, TableCard, FormsModule, ButtonDirective],
    templateUrl: './local-place-select.html',
    styleUrl: './local-place-select.css',
})
export class LocalPlaceSelect extends BaseComponent {
    OrderLocalType = OrderLocalType;
    placeType = model.required<OrderLocalType>();
    visible = model.required<boolean>();
    orderService = inject(OrderService);

    // ── Search ────────────────────────────────────────────────────────────────
    searchTerm = signal('');

    filteredItems = computed((): IHutSearchRow[] | IRoomSearchRow[] | ITableSearchRow[] => {
        const all = this.items();
        const term = this.searchTerm().trim().toLowerCase();
        if (!term) return all;
        return all.filter((item: any) => (item.name as string).toLowerCase().includes(term)) as typeof all;
    });

    searchPlaceholder = computed(() => {
        switch (this.placeType()) {
            case OrderLocalType.Hut:   return 'ابحث عن كوخ';
            case OrderLocalType.Room:  return 'ابحث عن غرفة';
            case OrderLocalType.Table: return 'ابحث عن طاولة';
        }
    });

    // ── State ─────────────────────────────────────────────────────────────────
    items = signal<IHutSearchRow[] | IRoomSearchRow[] | ITableSearchRow[]>([]);
    chosenLocalPlace = this.orderService.chosenLocalPlace;
    tempChosenLocalPlace = linkedSignal<ChosenLocalPlace | null>(() => this.chosenLocalPlace());
    isHutSelected = computed(() => this.tempChosenLocalPlace()?.type === OrderLocalType.Hut);
    hasSelection = computed(() => !!this.tempChosenLocalPlace()?.id);

    selectionLabel = computed(() => {
        switch (this.tempChosenLocalPlace()?.type) {
            case OrderLocalType.Hut:   return 'الكوخ المختار';
            case OrderLocalType.Room:  return 'الغرفة المختارة';
            case OrderLocalType.Table: return 'الطاولة المختارة';
            default: return 'المختار';
        }
    });

    reservationMinutes = signal(30);

    paginationInfo = {
        pageIndex: 1,
        totalPagesCount: 1,
        totalRowsCount: 0,
    };

    hutService   = inject(HutService);
    roomService  = inject(RoomService);
    tableService = inject(TableService);

    placeService = computed(() => {
        switch (this.placeType()) {
            case OrderLocalType.Hut:   return this.hutService;
            case OrderLocalType.Room:  return this.roomService;
            case OrderLocalType.Table: return this.tableService;
        }
    });

    placeServiceChangeEffect = effect(() => {
        this.items.set([]);
        this.paginationInfo = { pageIndex: 1, totalPagesCount: 1, totalRowsCount: 0 };
        untracked(() => this.searchTerm.set(''));
        this.searchPlaces({ pageIndex: 1 });
    });

    // ── Tab switching ──────────────────────────────────────────────────────────
    setActiveTab(tab: OrderLocalType): void {
        this.placeType.set(tab);
    }

    // ── Data loading ──────────────────────────────────────────────────────────
    searchPlaces(dto: { searchTerm?: string; pageIndex: number }) {
        this.placeService()
            .search({
                paginationInfo: { pageIndex: dto.pageIndex, pageSize: 30 },
                searchFilters: [],
                fromDate: null,
                toDate: null,
            })
            .subscribe({
                next: (res) => {
                    if (res.value.rows.length === 0) return;
                    if (dto.pageIndex === 1) this.items.set(res.value.rows);
                    else this.items.update((prev) => prev.concat(res.value.rows));
                    this.paginationInfo = {
                        pageIndex: dto.pageIndex,
                        totalPagesCount: res.value.paginationInfo.totalPagesCount,
                        totalRowsCount: res.value.paginationInfo.totalRowsCount,
                    };
                },
            });
    }

    onScroll(event: Event, scroller: HTMLElement) {
        if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1) {
            this.searchPlaces({ pageIndex: this.paginationInfo.pageIndex + 1 });
        }
    }

    onSelected(item: Omit<IChosenPlace, 'type'>) {
        if (!item.isAvailable || item.reservedTo) return;
        this.tempChosenLocalPlace.set({
            ...item,
            type: this.placeType(),
            reservationMinutes: this.placeType() === OrderLocalType.Hut ? this.reservationMinutes() : null,
        });
    }

    // ── Dialog actions ────────────────────────────────────────────────────────
    closeDialog() {
        if (!this.hasSelection()) return;
        if (this.isHutSelected()) {
            this.tempChosenLocalPlace.update((p) =>
                p ? { ...p, reservationMinutes: this.reservationMinutes() } : null
            );
        }
        this.chosenLocalPlace.set(this.tempChosenLocalPlace());
        this.dialogService.close({ type: DialogType.LocalPlaceSelect, data: this.chosenLocalPlace() });
    }

    cancelDialog() {
        this.dialogService.close({ type: DialogType.LocalPlaceSelect, data: null });
    }
}
