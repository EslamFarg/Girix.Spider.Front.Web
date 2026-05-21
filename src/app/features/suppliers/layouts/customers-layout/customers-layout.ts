import { Component } from '@angular/core';
import { ISectionLink, SectionNav } from '@/components/section-nav/section-nav';
import { RouterOutlet } from '@angular/router';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';

@Component({
  selector: 'app-customers-layout',
  imports: [SectionNav, RouterOutlet, SectionWrapper],
  templateUrl: './customers-layout.html',
  styleUrl: './customers-layout.css',
})
export class CustomersLayout {
  links: ISectionLink[] = [
    {
      labelKey: 'CUSTOMERS.EXPLORER',
      url: '/customers-suppliers/customers',
    },
    {
      labelKey: 'CUSTOMERS.ADD',
      url: '/customers-suppliers/customers/add',
    },
  ];
}
