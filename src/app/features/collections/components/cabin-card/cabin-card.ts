import { Component, input } from '@angular/core';
import { CountdownComponent, CountdownConfig, CountdownEvent } from 'ngx-countdown';

export enum CabinStatus {
  Available = 0,
  Reserved = 1,
  OnHold = 2,
}

@Component({
  selector: 'app-cabin-card',
  imports: [CountdownComponent],
  templateUrl: './cabin-card.html',
  styleUrl: './cabin-card.css',
})
export class CabinCard {
  //enum
  CabinStatus = CabinStatus;

  cabinStatus = input<CabinStatus>(CabinStatus.Available);

  //countdown
  countdownConfig: CountdownConfig = { format: 'hh:mm:ss', leftTime: 60 * 60 * 2 };
  handleCountdownEvent(event: CountdownEvent) {}


  get cabinStatusClass() {
    switch (this.cabinStatus()) {
      case CabinStatus.Available:
        return 'cabin-available';
      case CabinStatus.Reserved:
        return 'cabin-reserved';
      case CabinStatus.OnHold:
        return 'cabin-on-hold';
      default:
        return '';
    }
  }
}
