import { Component, input } from '@angular/core';

export enum RoomStatus {
  Available = 0,
  Reserved = 1,
  OnHold = 2,
}

@Component({
  selector: 'app-room-card',
  imports: [],
  templateUrl: './room-card.html',
  styleUrl: './room-card.css',
})
export class RoomCard {
  RoomStatus = RoomStatus;
  cabinStatus = input<RoomStatus>(RoomStatus.Available);

  get roomStatusClass() {
    switch (this.cabinStatus()) {
      case RoomStatus.Available:
        return 'replacements-available';
      case RoomStatus.Reserved:
        return 'replacements-reserved';
      case RoomStatus.OnHold:
        return 'replacements-on-hold';
      default:
        return '';
    }
  }
}
