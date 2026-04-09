import { Component } from '@angular/core';
import { ISectionLink, SectionNav } from '@/components';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-inventory-layout',
  imports: [SectionNav, RouterOutlet],
  templateUrl: './inventory-layout.html',
  styleUrl: './inventory-layout.css',
})
export class InventoryLayout {
  links: ISectionLink[] = [
    {
      labelKey: 'INVENTORY.EXPLORER',
      url: '/storage/inventory',
    },
    {
      labelKey: 'INVENTORY.ADD',
      url: '/storage/inventory/add',
    },
  ];
}
