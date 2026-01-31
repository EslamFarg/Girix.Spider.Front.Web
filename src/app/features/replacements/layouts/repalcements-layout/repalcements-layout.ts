import { IRoomSearchRow, RoomSearchEnum, RoomService } from '@/features/restaurant/services/room-service';
import { Component, effect, inject, signal } from '@angular/core';
import { ILocalSpaceItem, ReplacementsService, SpaceTypeEnum } from '../../services/replacements-service';
import { CountdownConfig, CountdownEvent, CountdownComponent } from 'ngx-countdown';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { RouterOutlet } from '@angular/router';
import { HutService, IHutSearchRow, HutSearchEnum } from '@/features/restaurant/services/hut-service';
import { ITableSearchRow, TableSearchEnum, TableService } from '@/features/restaurant/services/table-service';
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
  SpaceTypeEnum = SpaceTypeEnum;

  //

  replacementsService = inject(ReplacementsService);
  isVisible = this.replacementsService.isDialogVisible;
  currentItem = this.replacementsService.currentItem;
  changeToSpace = signal<SpaceTypeEnum>(SpaceTypeEnum.Room);
  orderService = inject(OrderService);
  countdownConfig: CountdownConfig = { format: 'hh:mm:ss', leftTime: 60 * 60 * 2 };
  handleCountdownEvent(event: CountdownEvent) {}
  closeDialog = this.replacementsService.closeDialog;

  setChangeToSpace(spaceType: SpaceTypeEnum) {
    this.changeToSpace.set(spaceType);
    this.hutChangeFg.reset();
    switch (spaceType) {
      case SpaceTypeEnum.Room:
        this.searchRooms(1);
        break;
      case SpaceTypeEnum.Hut:
        this.searchHuts(1);
        break;
      case SpaceTypeEnum.Table:
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
    //       case SpaceTypeEnum.Rooms:
    //         this.searchRooms(1);
    //         break;
    //       case SpaceTypeEnum.Huts:
    //         this.searchHuts(1);
    //         break;
    //       case SpaceTypeEnum.Tables:
    //         this.searchTables(1);
    //         break;
    //     }
    //   }
    // });

    effect(() => {
      if (this.isVisible() && this.currentItem()) {
        switch (this.changeToSpace()) {
          case SpaceTypeEnum.Room:
            this.searchRooms(1);
            break;
          case SpaceTypeEnum.Hut:
            this.searchHuts(1);
            break;
          case SpaceTypeEnum.Table:
            this.searchTables(1);
            break;
        }
      }
    });
  }

  changeToItem = signal<ILocalSpaceItem | null>(null);
  chooseItem(item: ILocalSpaceItem) {
    if (item.localSpaceType == SpaceTypeEnum.Hut) {
      this.hutChangeFg.patchValue({
        name: item.data.name,
        pricePerHour: item.data.pricePerHour,
      });
    }
    this.changeToItem.set(item);
  }

  submitItemChange() {
    const changeToItem = this.changeToItem();
    const orderId = this.currentItem()?.data.orderId;

    if (!changeToItem) {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'يجب اختيار المكان' });
      return;
    }

    if (changeToItem?.localSpaceType == this.localSpaceTypeEnum.Hut && this.hutChangeFg.invalid) {
      this.hutChangeFg.markAllAsTouched();
      return;
    }

    console.log(changeToItem);

    this.orderService
      .changeLocalPlace({
        durationMinutes: this.hutChangeFg.get('durationMinutes')?.value ?? null,
        id: orderId!,
        placeType: changeToItem!.localSpaceType,
        placeRefId: changeToItem!.data.id,
      })
      .subscribe({
        next: () => {
          this.changeToItem.set(null);
          this.currentItem.set(null);
          this.closeDialog();
          this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'لقد قمت بالحفظ بنجاح' });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: err.title, detail: err.detail });
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
  rooms = signal<IRoomSearchRow[]>([]);
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
            column: RoomSearchEnum.IsAvaliable,
            values: ['true'],
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
  onScroll(event: Event) {
    let scrollingContainer = event.target as HTMLElement;

    const rightOffset = Math.abs(scrollingContainer.scrollLeft) + scrollingContainer.offsetWidth;

    if (rightOffset < scrollingContainer.scrollWidth - 5) return;

    switch (this.changeToSpace()) {
      case SpaceTypeEnum.Room:
        this.searchRooms(this.roomPaginationInfo.pageIndex + 1);
        break;
      case SpaceTypeEnum.Hut:
        this.searchHuts(this.hutPaginationInfo.pageIndex + 1);
        break;
      case SpaceTypeEnum.Table:
        this.searchTables(this.tablePaginationInfo.pageIndex + 1);
        break;
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
  huts = signal<IHutSearchRow[]>([]);
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
            column: HutSearchEnum.IsAvaliable,
            values: ['true'],
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
  tables = signal<ITableSearchRow[]>([]);
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
            column: TableSearchEnum.IsAvaliable,
            values: ['true'],
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
