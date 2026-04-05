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
      labelKey: 'inventory.explorer',
      url: '/storage/inventory',
    },
    {
      labelKey: 'inventory.add',
      url: '/storage/inventory/add',
    },
  ];
}
