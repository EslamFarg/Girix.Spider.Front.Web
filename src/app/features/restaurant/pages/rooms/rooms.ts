import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Button, ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { IRoomReadResponse, IRoomSearchRow, RoomSearchEnum, RoomService } from '../../services/room-service';
import { noSymbolsAllowed } from '@/lib/text-validators';
import { omitKeys } from '@/lib/helpers';
import { Debounce } from '@/directives/debounce';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-rooms',
  imports: [
    Button,
    ReactiveFormsModule,
    InputErrorMessageHandler,
    InputGroupAddon,
    Select,
    InputTextModule,
    SectionWrapper,
    Paginator,
    ButtonDirective,
    Debounce,
  ],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css',
})
export class Rooms extends BaseComponent {
  currentItem: IRoomReadResponse | null = null;

  initialRoomFormValue = {
    id: this.fb.control<number>(0, []),
    searchEnum: this.fb.control<RoomSearchEnum>(RoomSearchEnum.Name, []),
    name: this.fb.control<string>('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
      noSymbolsAllowed,
    ]),
  };

  roomFg = this.fb.group(this.initialRoomFormValue);

  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<RoomSearchEnum>(RoomSearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };

  searchFg = this.fb.group(this.initialSearchFormValue);

  resetRoomForm = () => {
    this.roomFg = this.fb.group(this.initialRoomFormValue);
    this.currentItem = null;
  };

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousUTCDate(1) },
    { label: 'اخر اسبوع', value: this.getPreviousUTCDate(7) },
    { label: 'اخر شهر', value: this.getPreviousUTCDate(30) },
    { label: 'اخر سنة', value: this.getPreviousUTCDate(365) },
  ];

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

  roomService = inject(RoomService);

  constructor() {
    super();

    this.searchRooms(1);
  }

  rooms = signal<IRoomSearchRow[]>([]);
  roomsPaginationInfo = signal<IPaginationInfo>({
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  });

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
          this.roomsPaginationInfo.set({
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          });
        },
      });
  }

  onRoomFormSubmit() {
    if (this.roomFg.invalid) {
      this.roomFg.markAllAsTouched();
      return;
    }

    if (this.currentItem) {
      this.roomService.put(this.roomFg.getRawValue()).subscribe({
        next: () => {
          this.searchRooms(1);
          this.resetRoomForm();
        },
      });
    } else {
      this.roomService.create(omitKeys(this.roomFg.getRawValue(), ['id'])).subscribe({
        next: () => {
          this.searchRooms(1);
          this.resetRoomForm();
        },
      });
    }
  }

  onPageChange = (event: PaginatorState) => this.searchRooms(event.page! + 1);
  onSearchSubmit = () => this.searchFg.valid && this.searchRooms(1);

  fetchAndBindTableData(roomId: number) {
    return this.roomService.getById(roomId).subscribe({
      next: (res) => {
        this.roomFg.patchValue(res);
        this.currentItem = res;
      },
    });
  }

  deleteRoom(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف الغرفة؟',
      header: 'حذف الغرفة',
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

      accept: () => this.roomService.delete(id).subscribe({ next: () => this.searchRooms(1) }),
      reject: () => this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' }),
    });
  }
}
