import { ISectionLink, SectionNav } from '@/components/section-nav/section-nav';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-purchases-returns-layout',
  imports: [RouterOutlet, SectionNav],
  templateUrl: './purchases-returns-layout.html',
  styleUrl: './purchases-returns-layout.css',
})
export class PurchasesReturnsLayout {
links: ISectionLink[] = [
    {
      labelKey: 'purchasesReturns.explorer',
      url: '/storage/purchases-returns',
     },
    {
      labelKey: 'purchasesReturns.add',
      url: '/storage/purchases-returns/add',
     },
  ];
}
