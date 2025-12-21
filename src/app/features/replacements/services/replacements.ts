import { Injectable, signal } from '@angular/core';

export enum SpacesEnum {
  Rooms,
  Cabins,
  Tables,
  Deliveries,
}

@Injectable({
  providedIn: 'root',
})
export class Replacements {
  isDialogVisible = signal(false);
  currentSpace = signal(SpacesEnum.Rooms);

  openDialog(currentSpace: SpacesEnum) {
    this.currentSpace.set(currentSpace);
    this.isDialogVisible.set(true);
  }

  closeDialog() {
    this.isDialogVisible.set(false);
  }
}
