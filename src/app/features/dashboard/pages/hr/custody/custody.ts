import { Component } from '@angular/core';

@Component({
  selector: 'app-custody',
  imports: [],
  templateUrl: './custody.html',
  styleUrl: './custody.scss',
})
export class Custody {
    itemsTable: any = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  itemName: `لابتوب ${i + 1}`, // اسم الوحدة
}));
}
