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
      labelKey: 'PRODUCTS.EXPLORER',
      url: '/classes/products',
    },
    {
      labelKey: 'PRODUCTS.ADD',
      url: '/classes/products/add',
    },
  ];
}
