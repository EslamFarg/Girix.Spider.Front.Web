import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { API_GRID_PAGE_SIZE } from '@/core/constants/pagination.constants';
import { IRoomReadResponse, IRoomSearchRow, RoomSearchEnum, RoomService } from '../../services/room-service';
import {
  clearMasterDataEditMode,
  isMasterDataRowSelected,
  logRowSelectClick,
  RowSelectSource,
  selectMasterDataRow,
} from '../../utils/master-data-row-edit';
import { noSymbolsAllowed } from '@/yn-ng/utils/text-validators';
import { omitKeys } from '@/yn-ng/utils/helpers';
import { Debounce } from '@/directives/debounce';
import { MenuItem } from 'primeng/api';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { TooltipModule } from 'primeng/tooltip';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-rooms',
  imports: [
    ReactiveFormsModule,
    InputErrorMessageHandler,
    InputTextModule,
    SectionWrapper,
    ButtonDirective,
    Debounce,
    LoadingDisabledDirective,
    TooltipModule,
    TranslatePipe,
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
      Validators.minLength(2),
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

  get isEditMode() {
    return !!this.currentItem;
  }

  isRowSelected = (rowId: number) => isMasterDataRowSelected(rowId, this.currentItem);

  resetRoomForm = () => clearMasterDataEditMode(this.roomFg, (item) => (this.currentItem = item));

  onRowSelect(item: IRoomSearchRow, source: RowSelectSource = 'row') {
    logRowSelectClick(item, source, 'rooms');
    selectMasterDataRow(
      item.id,
      (id) => this.roomService.getById(id),
      this.roomFg,
      (res) => (this.currentItem = res),
      undefined,
      { screen: 'rooms', source },
    );
  }

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousLocalDateIso(1) },
    { label: 'اخر اسبوع', value: this.getPreviousLocalDateIso(7) },
    { label: 'اخر شهر', value: this.getPreviousLocalDateIso(30) },
    { label: 'اخر سنة', value: this.getPreviousLocalDateIso(365) },
  ];

  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'الاسم',
      command: () => this.searchFg.patchValue({ searchEnum: RoomSearchEnum.Name }),
    },
    {
      label: 'متاح',
      command: () => this.searchFg.patchValue({ searchEnum: RoomSearchEnum.IsAvaliable }),
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
          pageSize: API_GRID_PAGE_SIZE,
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

  onSearchSubmit = () => this.searchFg.valid && this.searchRooms(1);

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

      accept: () =>
        this.roomService.delete(id).subscribe({
          next: () => {
            if (this.currentItem?.id === id) this.resetRoomForm();
            this.searchRooms(1);
          },
        }),
    });
  }
}
