import { ISectionLink, SectionNav } from '@/components/section-nav/section-nav';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-collective-payments-layout',
  imports: [SectionNav,RouterOutlet],
  templateUrl: './collective-payments-layout.html',
  styleUrl: './collective-payments-layout.css',
})
export class CollectivePaymentsLayout {
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
