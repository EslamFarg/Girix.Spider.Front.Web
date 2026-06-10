import { Component } from '@angular/core';

@Component({
  selector: 'app-categories',
  imports: [],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {

  
  itemsTable: any = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  itemName: ` ${i + 1}`, // اسم الوحدة
}));
}
