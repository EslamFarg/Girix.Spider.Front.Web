import { IRoomSearchRow, RoomSearchEnum, RoomService } from '@/features/restaurant/services/room-service';
import { Component, effect, inject, signal } from '@angular/core';
import { ILocalSpaceItem, ReplacementsService, SpaceTypeEnum } from '../../services/replacements-service';
import { CountdownConfig, CountdownEvent, CountdownComponent } from 'ngx-countdown';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { RouterOutlet } from '@angular/router';
import { HutService, IHutSearchRow, HutSearchEnum } from '@/features/restaurant/services/hut-service';
import { ITableSearchRow, TableSearchEnum, TableService } from '@/features/restaurant/services/table-service';
import { BaseComponent } from '@/components/base-component/base-component';
import { HutCard } from '@/components/hut-card/hut-card';
import { RoomCard } from '@/components/room-card/room-card';
import { TableCard } from '@/components/table-card/table-card';
import { OrderService } from '@/features/orders';
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
    ButtonDirective
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



    this.orderService
      .changeLocalPlace({
        durationMinutes: this.hutChangeFg.get('durationMinutes')?.value ?? null,
        id: orderId!,
        placeType: changeToItem!.localSpaceType,
        placeRefId: changeToItem!.data.id,
        placeName: changeToItem!.data.name,
        reservedAt: this.localDateIso,
      })
      .subscribe({
        next: () => {
          this.changeToItem.set(null);
          this.currentItem.set(null);
          this.closeDialog();
          this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'لقد قمت بالحفظ بنجاح' });
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
  searchRooms(pageIndex: number) {
    this.roomService
      .search({
        paginationInfo: {
          pageIndex: 0,
          pageSize: 0,
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
          this.rooms.set(res.value.rows);
        },
      });
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
  searchHuts(pageIndex: number) {
    this.hutService
      .search({
        paginationInfo: {
          pageIndex: 0,
          pageSize: 0,
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
          this.huts.set(res.value.rows);
        },
      });
  }

  //
  //
  //
  //
  //
  //dialog tables

  tableService = inject(TableService);
  tables = signal<ITableSearchRow[]>([]);
  searchTables(pageIndex: number) {
    this.tableService
      .search({
        paginationInfo: {
          pageIndex: 0,
          pageSize: 0,
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
          this.tables.set(res.value.rows);
        },
      });
  }
}
