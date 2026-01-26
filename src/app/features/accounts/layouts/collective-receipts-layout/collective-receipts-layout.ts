import { ISectionLink, SectionNav } from '@/components/section-nav/section-nav';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-collective-receipts-layout',
  imports: [SectionNav, RouterOutlet],
  templateUrl: './collective-receipts-layout.html',
  styleUrl: './collective-receipts-layout.css',
})
export class CollectiveReceiptsLayout {
  links: ISectionLink[] = [
    {
      labelKey: 'products.explorer',
      url: '/classes/products',
    },
    {
      labelKey: 'products.add',
      url: '/classes/products/add',
    },
  ];
}
