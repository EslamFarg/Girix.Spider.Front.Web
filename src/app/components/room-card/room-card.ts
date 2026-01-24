import { IRoomSearchRow } from '@/features/restaurant/services/room-service';
import { Component, computed, input, signal } from '@angular/core';

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

  data = input.required<IRoomSearchRow>();

  ngOnInit() {
    if (this.data().isAvailable) {
      this.hutStatus.set(RoomStatus.Available);
    } else {
      this.hutStatus.set(RoomStatus.Reserved);
    }
  }

    roomStatusClass= computed(() => {
    switch (this.hutStatus()) {
      case RoomStatus.Available:
        return 'room-available';
      case RoomStatus.Reserved:
        return 'room-reserved';
      case RoomStatus.OnHold:
        return 'room-on-hold';
      default:
        return '';
    }
    
  })
}
