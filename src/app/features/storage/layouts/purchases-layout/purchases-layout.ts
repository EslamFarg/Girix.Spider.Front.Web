import { ISectionLink, SectionNav } from '@/components/section-nav/section-nav';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-purchases-layout',
  imports: [RouterOutlet, SectionNav],
  templateUrl: './purchases-layout.html',
  styleUrl: './purchases-layout.css',
})
export class PurchasesLayout {
  links: ISectionLink[] = [
    {
      labelKey: 'PURCHASES.EXPLORER',
      url: '/storage/purchases',
    },
    {
      labelKey: 'PURCHASES.ADD',
      url: '/storage/purchases/add',
    },
  ];
}
