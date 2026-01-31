import { Component, inject, signal } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { ReplacementsService, SpaceTypeEnum } from '../../services/replacements-service';
import { RoomCard } from '@/components/room-card/room-card';
import { CountdownConfig, CountdownEvent } from 'ngx-countdown';
import {
  IRoomReadResponse,
  IRoomSearchRow,
  RoomSearchEnum,
  RoomService,
} from '@/features/restaurant/services/room-service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-rooms',
  imports: [
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    ReactiveFormsModule,
    InputTextModule,
    Paginator,
    RoomCard,
  ],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css',
})
export class Rooms extends BaseComponent {
  dateNow = new Date();
  getFutureDate() {
    const date = new Date(this.dateNow);
    date.setDate(date.getDate() + 1);
    return date.toISOString();
  }
  getPastDate() {
    const date = new Date(this.dateNow);
    date.setDate(date.getDate() - 1);
    return date.toISOString();
  }

  replacementsService = inject(ReplacementsService);
  openDialog = this.replacementsService.openDialog;

  //countdown
  // countDownEles = viewChildren<CountdownComponent>('countdown');
  countdownConfig: CountdownConfig = { format: 'hh:mm:ss', leftTime: 60 * 60 * 2 };
  handleCountdownEvent(event: CountdownEvent) {}

  ngAfterViewInit() {
    // this.countDownEles().forEach((ele) => {
    // ele.begin();
    // });
  }

  currentItem: IRoomReadResponse | null = null;

  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<RoomSearchEnum>(RoomSearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };

  searchFg = this.fb.group(this.initialSearchFormValue);

  roomService = inject(RoomService);

  resetRoomForm = () => (this.currentItem = null);

  fetchAndBindTableData(tableId: number) {
    return this.roomService.getById(tableId).subscribe({
      next: (res) => {
        this.currentItem = res;
      },
    });
  }

  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'الاسم',
      command: (event) => this.searchFg.patchValue({ searchEnum: RoomSearchEnum.Name }),
    },
    {
      label: 'متاح',
      command: (event) => this.searchFg.patchValue({ searchEnum: RoomSearchEnum.IsAvaliable }),
    },
  ]);

  constructor() {
    super();

    this.searchRooms(1);
  }

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousUTCDate(1) },
    { label: 'اخر اسبوع', value: this.getPreviousUTCDate(7) },
    { label: 'اخر شهر', value: this.getPreviousUTCDate(30) },
    { label: 'اخر سنة', value: this.getPreviousUTCDate(365) },
  ];

  rooms = signal<IRoomSearchRow[]>([]);
  roomsPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };
  searchRooms(pageIndex: number) {
    this.roomService
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
          this.rooms.set(res.value.rows);
          this.roomsPaginationInfo = {
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  onSearchSubmit = () => this.searchFg.valid && this.searchRooms(1);

  onPageChange = (event: PaginatorState) => this.searchRooms(event.page! + 1);
}
