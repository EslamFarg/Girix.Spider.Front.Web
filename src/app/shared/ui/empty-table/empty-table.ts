import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-table',
  imports: [],
  templateUrl: './empty-table.html',
  styleUrl: './empty-table.scss',
})
export class EmptyTable {

  heightDiv = input<number>(0);
}
