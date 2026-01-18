import { Component, input } from '@angular/core';
export enum TableStatus {
  Available = 0,
  Reserved = 1,
  OnHold = 2,
}
@Component({
  selector: 'app-table-card',
  imports: [],
  templateUrl: './table-card.html',
  styleUrl: './table-card.css',
})
export class TableCard {
TableStatus = TableStatus;
  cabinStatus = input<TableStatus>(TableStatus.Available);

  get roomStatusClass() {
    switch (this.cabinStatus()) {
      case TableStatus.Available:
        return 'replacements-available';
      case TableStatus.Reserved:
        return 'replacements-reserved';
      case TableStatus.OnHold:
        return 'replacements-on-hold';
      default:
        return '';
    }
  }
}
