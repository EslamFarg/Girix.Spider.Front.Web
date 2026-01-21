import { IHutRowResponse } from '@/features/restaurant/services/hut-service';
import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
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
  countdownConfig: CountdownConfig = {
    leftTime: 0,
    formatDate: (opts) => {
      const currentDateTime = new Date().getTime();
      // const reservedFromTime = new Date(this.data().reservedFrom).getTime();
      const reservedToDate = new Date(this.data().reservedTo);
      const reservedToTime = reservedToDate.getTime();
      const isPastReservation = currentDateTime > reservedToTime;

      if (!this.data().isAvailable) {
        if (!isPastReservation) {
          const timeDiff = (reservedToTime - currentDateTime) / 1000;
          const hours = Math.floor(timeDiff / (60 * 60))
            .toString()
            .padStart(2, '0');
          const minutes = Math.floor((timeDiff % (60 * 60)) / 60)
            .toString()
            .padStart(2, '0');
          const seconds = Math.floor((timeDiff % 60) )
            .toString()
            .padStart(2, '0');
          return `${hours}:${minutes}:${seconds}`;
        } else {
          //count up from reservedToTime to currentDateTime
          const timeDiff = (currentDateTime - reservedToTime)/1000;
          const hours = Math.floor(timeDiff / ( 60 * 60))
            .toString()
            .padStart(2, '0');
          const minutes = Math.floor((timeDiff % ( 60 * 60)) / ( 60))
            .toString()
            .padStart(2, '0');
          const seconds = Math.floor((timeDiff % ( 60)) )
            .toString()
            .padStart(2, '0');
          return `-${hours}:${minutes}:${seconds}`;
        }
      } else {
        return '00:00:00';
      }
    },
  };
  countDownEl = viewChild<CountdownComponent>('countdown');
  handleCountdownEvent = (event: CountdownEvent) => {
    if (event.action === 'done' || event.action === 'stop') {
      console.log(event.action);

      // this.hutStatus.set(HutStatus.Available);
    }
  };

  ngOnInit() {
    console.log('-------------------------');
    if (this.data().isAvailable) {
      this.hutStatus.set(HutStatus.Available);
      console.log(this.hutStatusClass());
    } else {
      const currentDateTime = new Date().getTime();
      // const reservedFromTime = new Date(this.data().reservedFrom).getTime();
      const reservedToTime = new Date(this.data().reservedTo).getTime();
      const isPastReservation = currentDateTime > reservedToTime;

      console.log(`
        currentDateTime: ${new Date(currentDateTime).toISOString()}
        reservedToTime: ${new Date(reservedToTime).toISOString()}
        isPastReservation: ${isPastReservation}
        `);

      if (isPastReservation) {
        this.hutStatus.set(HutStatus.OnHold);
        this.countdownConfig = {
          ...this.countdownConfig,
          leftTime: -(reservedToTime - currentDateTime) / 1000,
        };
      } else {
        this.hutStatus.set(HutStatus.Reserved);
        this.countdownConfig = {
          ...this.countdownConfig,
          leftTime: (reservedToTime - currentDateTime) / 1000,
        };
      }

      console.log(this.hutStatusClass());

      // this.handleCountdownEvent = (event: CountdownEvent) => {
      //   if (event.action === 'done' || event.action === 'stop') {
      //     console.log(event.action);
      //     // this.hutStatus.set(HutStatus.Available);
      //   }
      // };
    }
  }

  hutStatusClass = computed(() => {
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
  });
}
