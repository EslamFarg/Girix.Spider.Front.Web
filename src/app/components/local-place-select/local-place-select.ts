import { Component, computed, effect, inject, model, signal } from '@angular/core';
import { Select } from 'primeng/select';
import { HutCard } from '../hut-card/hut-card';
import { Debounce } from '@/directives/debounce';
import { OrderLocalType, OrderService } from '@/features/orders';
import { RoomCard } from '../room-card/room-card';
import { TableCard } from '../table-card/table-card';
import { HutService, IHutSearchRow } from '@/features/restaurant/services/hut-service';
import { IRoomSearchRow, RoomService } from '@/features/restaurant/services/room-service';
import { ITableSearchRow, TableService } from '@/features/restaurant/services/table-service';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '../base-component/base-component';
import { DialogType } from '@/features/dialogs/enums';
import { InputText } from 'primeng/inputtext';
import { ButtonDirective } from 'primeng/button';

type IChosenPlace = (IHutSearchRow | IRoomSearchRow | ITableSearchRow) & { type: OrderLocalType };
export type ChosenLocalPlace = IChosenPlace & {
    reservationMinutes: number | null;
};

@Component({
    selector: 'app-local-place-select',
    imports: [Select, HutCard, Debounce, RoomCard, TableCard, TranslatePipe, FormsModule, InputText, ButtonDirective],
    templateUrl: './local-place-select.html',
    styleUrl: './local-place-select.css',
})
export class LocalPlaceSelect extends BaseComponent {
    OrderLocalType = OrderLocalType;
    placeType = model.required<OrderLocalType>();
    visible = model.required<boolean>();
    orderService = inject(OrderService);

    items = signal<IHutSearchRow[] | IRoomSearchRow[] | ITableSearchRow[]>([]);
    chosenLocalPlace = this.orderService.chosenLocalPlace;
    reservationMinutes = signal(30);

    paginationInfo = {
        pageIndex: 1,
        totalPagesCount: 1,
        totalRowsCount: 0,
    };

    hutService = inject(HutService);
    roomService = inject(RoomService);
    tableService = inject(TableService);

    placeService = computed(() => {
        switch (this.placeType()) {
            case OrderLocalType.Hut:
                return this.hutService;
            case OrderLocalType.Room:
                return this.roomService;
            case OrderLocalType.Table:
                return this.tableService;
        }
    });

    placeServiceChangeEffect = effect(() => {
        // const placeService = this.placeService();
        this.items.set([]);
        this.paginationInfo = {
            pageIndex: 1,
            totalPagesCount: 1,
            totalRowsCount: 0,
        };
        this.searchPlaces({ pageIndex: 1 });
    });

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
        // if at bottom
        if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1) {
            this.searchPlaces({ pageIndex: this.paginationInfo.pageIndex + 1 });
        }
    }

    onSelected(item: Omit<IChosenPlace, 'type'>) {
        if (!item.isAvailable || item.reservedTo) return;
        this.chosenLocalPlace.set({
            ...item,
            type: this.placeType(),
            reservationMinutes: this.isHutSelected() ? this.reservationMinutes() : null,
        });
    }

    closeDialog() {
        this.dialogService.close({
            type: DialogType.LocalPlaceSelect,
            data: this.chosenLocalPlace(),
        });
    }

    isHutSelected() {
        return this.placeType() === OrderLocalType.Hut;
    }
}
