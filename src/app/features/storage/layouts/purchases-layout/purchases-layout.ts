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
      labelKey: 'purchases.explorer',
      url: '/storage/purchases',
     },
    {
      labelKey: 'purchases.add',
      url: '/storage/purchases/add',
     },
  ];
}
