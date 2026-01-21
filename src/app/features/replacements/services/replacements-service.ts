import BaseService from '@/core/services/BaseService';
import { IHutRowResponse } from '@/features/restaurant/services/hut-service';
import { IRoomRowResponse } from '@/features/restaurant/services/room-service';
import { ITableRowResponse } from '@/features/restaurant/services/table-service';
import { computed, Injectable, signal } from '@angular/core';

export enum SpacesEnum {
  Rooms,
  Huts,
  Tables,
  Deliveries,
}

export interface ILocalSpaceItem {
  data: IRoomRowResponse | IHutRowResponse | ITableRowResponse;
  localSpaceType: SpacesEnum;
}

@Injectable({
  providedIn: 'root',
})
export class ReplacementsService extends BaseService {
  isDialogVisible = computed(() => this.currentItem() !== null);
  currentItem = signal<ILocalSpaceItem | null>(null);
 
  openDialog = (replacementItem: ILocalSpaceItem) => this.currentItem.set(replacementItem);

  closeDialog = () => this.currentItem.set(null);
}
