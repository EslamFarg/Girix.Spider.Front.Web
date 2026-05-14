import { ITableSearchRow } from '@/features/restaurant/services/table-service';
import { Component, input, signal, computed } from '@angular/core';
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
  data = input.required<ITableSearchRow>();
  active = input<boolean>(false);

  tableStatusClass = computed(() =>
    this.active() ? 'active table-available' : this.data()?.isAvailable ? ' table-available' : ' table-reserved',
  );
}
