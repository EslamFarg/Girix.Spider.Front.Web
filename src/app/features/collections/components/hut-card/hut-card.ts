import { IHutRowResponse } from '@/features/restaurant/services/hut-service';
import { Component, input, signal } from '@angular/core';
import { CountdownComponent, CountdownConfig, CountdownEvent } from 'ngx-countdown';

export enum HutStatus {
  Available = 0,
  Reserved = 1,
  OnHold = 2,
}

@Component({
  selector: 'app-hut-card',
  imports: [CountdownComponent],
  templateUrl: './hut-card.html',
  styleUrl: './hut-card.css',
})
export class HutCard {
  //enum
  HutStatus = HutStatus;

  data = input.required<IHutRowResponse>();
  // id: number;
  // name: string;
  // pricePerHour: number;
  // isAvailable: boolean;
  // reservedTo: any;
  // reservedFrom: any;
  // orderId: number;

  hutStatus = signal<HutStatus>(HutStatus.Available);

  //countdown
  countdownConfig: CountdownConfig = {  leftTime: 0  };
  handleCountdownEvent(event: CountdownEvent) {
    if (event.action === 'done' || event.action === 'stop') {
      this.hutStatus.set(HutStatus.Available);

    }
  }

  ngOnInit() {
    const currentDate = new Date();


    if (this.data().isAvailable) {
      this.hutStatus.set(HutStatus.Available);
      //return
    } else {
      const reservedFrom = new Date(this.data().reservedFrom);
      const reservedTo = new Date(this.data().reservedTo);

      if (reservedFrom.getTime() <= currentDate.getTime() && currentDate.getTime() <= reservedTo.getTime()) {
        console.log('reserved');
        this.hutStatus.set(HutStatus.Reserved);
        this.countdownConfig = {
          ...this.countdownConfig,
          leftTime: (new Date(this.data().reservedTo).getTime() - currentDate.getTime()) * 1000,
        };
      } else {
        this.hutStatus.set(HutStatus.OnHold);
      }
    }
  }

  get hutStatusClass() {
    switch (this.hutStatus()) {
      case HutStatus.Available:
        return 'hut-available';
      case HutStatus.Reserved:
        return 'hut-reserved';
      case HutStatus.OnHold:
        return 'hut-on-hold';
      default:
        return '';
    }
  }
}
