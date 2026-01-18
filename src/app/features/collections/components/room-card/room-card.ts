import { IRoomRowResponse } from '@/features/restaurant/services/room-service';
import { Component, input, signal } from '@angular/core';

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
  hutStatus = signal<RoomStatus>(RoomStatus.Available);

  data = input.required<IRoomRowResponse>();

  ngOnInit() {
    if (this.data().isAvailable) {
      this.hutStatus.set(RoomStatus.Available);
    } else {
      this.hutStatus.set(RoomStatus.Reserved);
    }
  }

  get roomStatusClass() {
    switch (this.hutStatus()) {
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
