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
      labelKey: 'PURCHASES_RETURNS.EXPLORER',
      url: '/storage/purchases-returns',
    },
    {
      labelKey: 'PURCHASES_RETURNS.ADD',
      url: '/storage/purchases-returns/add',
    },
  ];
}
