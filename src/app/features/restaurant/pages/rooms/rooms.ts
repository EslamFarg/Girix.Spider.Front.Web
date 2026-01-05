import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Button, ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { IRoomDtoResponse, IRoomRowResponse, RoomService } from '../../services/room-service';
import { noSymbolsAllowed } from '@/lib/text-validators';
import { omitKeys } from '@/lib/helpers';

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
  ],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css',
})
export class Rooms extends BaseComponent<IRoomRowResponse> {
  currentItem: IRoomDtoResponse | null = null;

  initialFormValue = {
    id: this.fb.control<number>(0, []),
    name: this.fb.control<string>('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
      noSymbolsAllowed,
    ]),
  };
  fg = this.fb.group(this.initialFormValue);

  periodOptions = [
    { label: 'اليوم', value: 1 },
    { label: 'الاسبوع', value: 2 },
    { label: 'الشهر', value: 3 },
    { label: 'السنة', value: 4 },
  ];

  roomService = inject(RoomService);

  constructor() {
    super();
    this.resetState();
  }

  resetState() {
    this.fg = this.fb.group(this.initialFormValue);
    this.currentItem = null;
    this.roomService.resetSearchRequestModel();

    //get page 1 of 10 orders
    this.roomService.search().subscribe({
      next: (res) => {
        this.items.set(res.value.rows);
      },
    });
  }

  onSubmit() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    if ((this.fg.value?.id ?? 0) > 0) {
      this.roomService.update(this.fg.getRawValue()).subscribe({
        next: this.resetState,
      });
    } else {
      this.roomService.create(omitKeys(this.fg.getRawValue(), ['id'])).subscribe({
        next: this.resetState,
      });
    }
  }

  first = 0;
  rows = 10;
  onPageChange(event: PaginatorState) {
    console.log(event);
    this.roomService.search({ pageIndex: event.page! + 1 }).subscribe({
      next: (res) => {
        this.items.set(res.value.rows);
      },
    });
  }

  fetchAndBindTableData(tableId: number) {
    return this.roomService.getById(tableId).subscribe({
      next: (res) => {
        this.fg.patchValue(res);
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

      accept: () => {
        this.roomService.delete(id).subscribe({
          next: () => {
            this.resetState();
          },
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' });
      },
    });
  }
}
