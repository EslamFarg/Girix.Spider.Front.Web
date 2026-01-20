import { ITableRowResponse } from '@/features/restaurant/services/table-service';
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
  tableStatus = signal<TableStatus>(TableStatus.Available);
  data = input.required<ITableRowResponse>();

  ngOnInit() {
    if (this.data().isAvailable) {
      this.tableStatus.set(TableStatus.Available);
    } else {
      this.tableStatus.set(TableStatus.Reserved);
    }
  }

  tableStatusClass = computed(() => {
    switch (this.tableStatus()) {
      case TableStatus.Available:
        return ' table-available';
      case TableStatus.Reserved:
        return ' table-reserved';
      case TableStatus.OnHold:
        return ' table-on-hold';
      default:
        return '';
    }
  });
}
