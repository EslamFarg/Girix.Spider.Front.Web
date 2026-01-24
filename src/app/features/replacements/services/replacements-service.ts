import BaseService from '@/core/services/BaseService';
import { IHutSearchRow } from '@/features/restaurant/services/hut-service';
import { IRoomSearchRow } from '@/features/restaurant/services/room-service';
import { ITableSearchRow } from '@/features/restaurant/services/table-service';
import { computed, Injectable, signal } from '@angular/core';

export enum SpaceTypeEnum {
  Room = 1,
  Table = 2,
  Hut = 3,
  Deliveries,
}

export interface ILocalSpaceItem {
  data: IRoomSearchRow | IHutSearchRow | ITableSearchRow;
  localSpaceType: SpaceTypeEnum;
}

@Injectable({
  providedIn: 'root',
})
export class ReplacementsService extends BaseService {
  isDialogVisible = computed(() => this.currentItem() !== null);
  currentItem = signal<ILocalSpaceItem | null>(null);

  openDialog = (replacementItem: ILocalSpaceItem) => {
    if (replacementItem.data.isAvailable) {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'الموقع غير مشغول' });
      return;
    }

    this.currentItem.set(replacementItem);
  };

  closeDialog = () => this.currentItem.set(null);
}
