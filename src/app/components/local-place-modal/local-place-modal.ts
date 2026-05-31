import { Component, computed, inject, model, signal } from '@angular/core';
import { AppModal } from '../app-modal/app-modal';
import { Select } from 'primeng/select';
import { HutCard } from '../hut-card/hut-card';
import { Debounce } from '@/directives/debounce';
import { OrderLocalType } from '@/features/orders';
import { RoomCard } from '../room-card/room-card';
import { TableCard } from '../table-card/table-card';
import { HutService, IHutSearchRow } from '@/features/restaurant/services/hut-service';
import { IRoomSearchRow, RoomService } from '@/features/restaurant/services/room-service';
import { ITableSearchRow, TableService } from '@/features/restaurant/services/table-service';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

type IChosenPlace = (IHutSearchRow | IRoomSearchRow | ITableSearchRow) & { type: OrderLocalType };

@Component({
    selector: 'app-local-place-modal',
    imports: [AppModal, Select, HutCard, Debounce, RoomCard, TableCard,TranslatePipe,FormsModule],
    templateUrl: './local-place-modal.html',
    styleUrl: './local-place-modal.css',
})
export class LocalPlaceModal {
    OrderLocalType = OrderLocalType;
    placeType = model.required<OrderLocalType>();

    items = signal<IHutSearchRow[] | IRoomSearchRow[] | ITableSearchRow[]>([]);
    chosenPlace = signal<IChosenPlace | null>(null);
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
        this.items.set([]);
        this.paginationInfo = {
            pageIndex: 1,
            totalPagesCount: 1,
            totalRowsCount: 0,
        };

        switch (this.placeType()) {
            case OrderLocalType.Hut:
                return this.hutService;
            case OrderLocalType.Room:
                return this.roomService;
            case OrderLocalType.Table:
                return this.tableService;
        }
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
        this.chosenPlace.set({
            ...item,
            type: this.placeType(),
        });
    }
}
