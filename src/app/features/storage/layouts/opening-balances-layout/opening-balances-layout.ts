import { ISectionLink, SectionNav } from '@/components/section-nav/section-nav';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-opening-balances-layout',
  imports: [RouterOutlet, SectionNav],
  templateUrl: './opening-balances-layout.html',
  styleUrl: './opening-balances-layout.css',
})
export class OpeningBalancesLayout {
  links: ISectionLink[] = [
    {
      labelKey: 'openingBalances.explorer',
      url: '/storage/opening-balances',
    },
    {
      labelKey: 'openingBalances.add',
      url: '/storage/opening-balances/add',
    },
  ];
}
