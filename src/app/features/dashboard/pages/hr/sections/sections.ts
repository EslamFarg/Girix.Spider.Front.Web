import { Component } from '@angular/core';

@Component({
  selector: 'app-sections',
  imports: [],
  templateUrl: './sections.html',
  styleUrl: './sections.scss',
})
export class Sections {
  
  itemsTable: any = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  itemName: `الادارة ${i + 1}`, // اسم الوحدة
}));
}
