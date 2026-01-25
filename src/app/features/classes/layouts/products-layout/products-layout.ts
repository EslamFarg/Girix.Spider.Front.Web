import { Component } from '@angular/core';
import { ISectionLink, SectionNav } from '@/components/section-nav/section-nav';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-products-layout',
  imports: [SectionNav, RouterOutlet],
  templateUrl: './products-layout.html',
  styleUrl: './products-layout.css',
})
export class ProductsLayout {
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
 
