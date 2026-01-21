import { IRoomRowResponse, RoomSearchEnum, RoomService } from '@/features/restaurant/services/room-service';
import { Component, effect, inject, signal } from '@angular/core';
import { ILocalSpaceItem, ReplacementsService, SpacesEnum } from '../../services/replacements-service';
import { CountdownConfig, CountdownEvent, CountdownComponent } from 'ngx-countdown';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { RouterOutlet } from '@angular/router';
import { HutService, IHutRowResponse, HutSearchEnum } from '@/features/restaurant/services/hut-service';
import { ITableRowResponse, TableSearchEnum, TableService } from '@/features/restaurant/services/table-service';
import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { HutCard } from '@/components/hut-card/hut-card';
import { RoomCard } from '@/components/room-card/room-card';
import { TableCard } from '@/components/table-card/table-card';
import { OrderService } from '@/features/invoices/services/order-service';
import { ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';

type allowedDurationMinute = 30 | 60 | 90 | 120 | 150 | 180;

@Component({
  selector: 'app-repalcements-layout',
  imports: [
    InputErrorMessageHandler,
    CountdownComponent,
    Button,
    Dialog,
    Select,
    InputText,
    RouterOutlet,
    HutCard,
    RoomCard,
    TableCard,
    ɵInternalFormsSharedModule,
    ReactiveFormsModule,
  ],
  templateUrl: './repalcements-layout.html',
  styleUrl: './repalcements-layout.css',
})
export class RepalcementsLayout extends BaseComponent {
  SpacesEnum = SpacesEnum;

  //

  replacementsService = inject(ReplacementsService);
  isVisible = this.replacementsService.isDialogVisible;
  currentItem = this.replacementsService.currentItem;
  changeToSpace = signal<SpacesEnum>(SpacesEnum.Rooms);
  orderService = inject(OrderService);
  countdownConfig: CountdownConfig = { format: 'hh:mm:ss', leftTime: 60 * 60 * 2 };
  handleCountdownEvent(event: CountdownEvent) {}
  closeDialog = this.replacementsService.closeDialog;

  setChangeToSpace(spaceType: SpacesEnum) {
    this.changeToSpace.set(spaceType);
    switch (spaceType) {
      case SpacesEnum.Rooms:
        this.searchRooms(1);
        break;
      case SpacesEnum.Huts:
        this.searchHuts(1);
        break;
      case SpacesEnum.Tables:
        this.searchTables(1);
        break;
    }
  }

  /**
   *
   */
  constructor() {
    super();

    //refetch change to space items on route change if opened
    // this.router.events.subscribe(() => {
    //   if (this.isVisible() && this.currentItem()) {
    //     switch (this.changeToSpace()) {
    //       case SpacesEnum.Rooms:
    //         this.searchRooms(1);
    //         break;
    //       case SpacesEnum.Huts:
    //         this.searchHuts(1);
    //         break;
    //       case SpacesEnum.Tables:
    //         this.searchTables(1);
    //         break;
    //     }
    //   }
    // });

    effect(() => {
      if (this.isVisible() && this.currentItem()) {
        switch (this.changeToSpace()) {
          case SpacesEnum.Rooms:
            this.searchRooms(1);
            break;
          case SpacesEnum.Huts:
            this.searchHuts(1);
            break;
          case SpacesEnum.Tables:
            this.searchTables(1);
            break;
        }
      }
    });
  }

  changeToItem = signal<ILocalSpaceItem | null>(null);
  chooseItem(item: ILocalSpaceItem) {
    this.changeToItem.set(item);
  }

  submitItemChange() {
    const item = this.changeToItem();

    if (!item) {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'يجب اختيار المكان' });
    }
    
    if (item?.localSpaceType == this.localSpacesEnum.Huts && this.hutChangeFg.invalid) {
      this.hutChangeFg.markAllAsTouched();
      return;
    }

    this.orderService
      .changeLocalPlace({
        durationMinutes: this.hutChangeFg.get('durationMinutes')?.value ?? null,
        id: item!.data.orderId,
        placeType: item!.localSpaceType,
        placeRefId: item!.data.id,
      })
      .subscribe({
        next: () => {
          this.changeToItem.set(null);
          this.currentItem.set(null);
          this.closeDialog();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error.detail });
        },
      });
  }

  //
  //
  //
  //
  //
  //
  //dialog rooms

  roomService = inject(RoomService);
  rooms = signal<IRoomRowResponse[]>([]);
  roomPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };
  searchRooms(pageIndex: number) {
    this.roomService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 20,
        },
        searchFilters: [
          {
            column: RoomSearchEnum.Name,
            values: [''],
          },
        ],
        fromDate: null,
      })
      .subscribe({
        next: (res) => {
          if (res.value.rows.length > 0) {
            if (pageIndex === 1) this.rooms.set(res.value.rows);
            else this.rooms.update((prev) => prev.concat(res.value.rows));
            this.roomPaginationInfo = {
              pageIndex,
              totalPagesCount: res.value.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.paginationInfo.totalRowsCount,
            };
          }
        },
      });
  }
  onRoomsScroll(event: Event) {
    const menuContainer = event.target as HTMLElement;

    // if at bottom
    if (menuContainer.scrollTop + menuContainer.clientHeight >= menuContainer.scrollHeight - 1) {
      this.searchRooms(this.roomPaginationInfo.pageIndex + 1);
    }
  }

  //
  //
  //
  //
  //
  //dialog huts
  durationMinutesOptions: allowedDurationMinute[] = [30, 60, 90, 120, 150, 180];
  hutChangeFgInitialValue = {
    durationMinutes: this.fb.control<allowedDurationMinute | null>(null, [Validators.required]),
    name: this.fb.control<string>({ disabled: true, value: '' }, []),
    pricePerHour: this.fb.control<number>({ disabled: true, value: 0 }, []),
  };
  hutChangeFg = this.fb.group(this.hutChangeFgInitialValue);

  hutService = inject(HutService);
  huts = signal<IHutRowResponse[]>([]);
  hutPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };
  searchHuts(pageIndex: number) {
    this.hutService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 20,
        },
        searchFilters: [
          {
            column: HutSearchEnum.Name,
            values: [''],
          },
        ],
        fromDate: null,
      })
      .subscribe({
        next: (res) => {
          if (res.value.rows.length > 0) {
            if (pageIndex === 1) this.huts.set(res.value.rows);
            else this.huts.update((prev) => prev.concat(res.value.rows));
            this.hutPaginationInfo = {
              pageIndex,
              totalPagesCount: res.value.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.paginationInfo.totalRowsCount,
            };
          }
        },
      });
  }
  onHutsScroll(event: Event) {
    const menuContainer = event.target as HTMLElement;

    // if at bottom
    if (menuContainer.scrollTop + menuContainer.clientHeight >= menuContainer.scrollHeight - 1) {
      this.searchHuts(this.hutPaginationInfo.pageIndex + 1);
    }
  }

  //
  //
  //
  //
  //
  //dialog tables

  tableService = inject(TableService);
  tables = signal<ITableRowResponse[]>([]);
  tablePaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };
  searchTables(pageIndex: number) {
    this.tableService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 20,
        },
        searchFilters: [
          {
            column: TableSearchEnum.Name,
            values: [''],
          },
        ],
        fromDate: null,
      })
      .subscribe({
        next: (res) => {
          if (res.value.rows.length > 0) {
            if (pageIndex === 1) this.tables.set(res.value.rows);
            else this.tables.update((prev) => prev.concat(res.value.rows));

            this.tablePaginationInfo = {
              pageIndex,
              totalPagesCount: res.value.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.paginationInfo.totalRowsCount,
            };
          }
        },
      });
  }
  onTablesScroll(event: Event) {
    const menuContainer = event.target as HTMLElement;

    // if at bottom
    if (menuContainer.scrollTop + menuContainer.clientHeight >= menuContainer.scrollHeight - 1) {
      this.searchTables(this.tablePaginationInfo.pageIndex + 1);
    }
  }
}
