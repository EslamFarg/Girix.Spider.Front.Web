import { ISectionLink, SectionNav } from '@/components/section-nav/section-nav';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-purchases-refunds-layout',
  imports: [RouterOutlet, SectionNav],
  templateUrl: './purchases-refunds-layout.html',
  styleUrl: './purchases-refunds-layout.css',
})
export class PurchasesRefundsLayout {
links: ISectionLink[] = [
    {
      labelKey: 'purchasesRefunds.explorer',
      url: '/storage/purchases-refunds',
     },
    {
      labelKey: 'purchasesRefunds.add',
      url: '/storage/purchases-refunds/add',
     },
  ];
}
