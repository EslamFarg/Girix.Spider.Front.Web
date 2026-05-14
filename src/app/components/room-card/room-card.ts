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
  roomStatus = computed<RoomStatus>(() => (this.data().isAvailable ? RoomStatus.Available : RoomStatus.Reserved));

  data = input.required<IRoomSearchRow>();
  active = input<boolean>(false);
  
  roomStatusClass = computed(() => {
    if(this.active()) return 'room-available active';

    switch (this.roomStatus()) {
      case RoomStatus.Available:
        return 'room-available';
      case RoomStatus.Reserved:
        return 'room-reserved';
      case RoomStatus.OnHold:
        return 'room-on-hold';
      default:
        return '';
    }
  });
}
